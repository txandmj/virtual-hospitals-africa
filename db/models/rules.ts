import { sql } from 'kysely'
import { AgeDetermination, ApplicableRule, NewRecordsToConsider, TrxOrDbOrQueryCreator } from '../../types.ts'
import { asText, jsonBuildObject, literalString } from '../helpers.ts'
import { groupBy } from '../../util/groupBy.ts'
import { FINDING_SITE } from '../../shared/snomed_concepts.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { any_query_evidence } from '../../shared/s_expression_schemas.ts'
import uniq from '../../util/uniq.ts'
import partition from '../../util/partition.ts'
import { s_expression_evidence } from './s_expression_evidence.ts'
import { exists } from '../../util/exists.ts'
import compactMap from '../../util/compactMap.ts'
import { base, identity } from './_base.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'

export const rules = base({
  top_level_table: 'rules',
  baseQuery(trx: TrxOrDbOrQueryCreator, {
    // patient_id,
    patient_age_determination,
    positive_record_ids,
    type,
  }: {
    patient_id: string
    patient_age_determination: AgeDetermination
    positive_record_ids: string[]
    type?: 'task' | 'system_priority_evaluation' | 'system_diagnosis_rule'
  }) {
    assert(positive_record_ids.length)
    const by_findings_query = trx.selectFrom('rules')
      .innerJoin('rule_due_to_findings', 'rules.id', 'rule_due_to_findings.rule_id')
      .innerJoin('due_to_findings', 'due_to_findings.id', 'rule_due_to_findings.due_to_finding_id')
      .innerJoin(
        'snomed_concept_active_descendants_realized as specific_descendants',
        'specific_descendants.ancestor_id',
        'due_to_findings.specific_snomed_concept_id',
      )
      .innerJoin('patient_records', 'patient_records.specific_snomed_concept_id', 'specific_descendants.descendant_id')
      .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
      .whereRef('patient_records.root_snomed_concept_id', '=', 'due_to_findings.root_snomed_concept_id')
      .where('rules.age_determinations', '@>', sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`)
      .where('patient_records.id', 'in', positive_record_ids)
      .where((eb) =>
        eb.or([
          eb('due_to_findings.value_snomed_concept_id', 'is', null),
          eb.exists(
            eb.selectFrom('snomed_concept_active_descendants_realized as value_descendants')
              .whereRef('value_descendants.ancestor_id', '=', 'due_to_findings.value_snomed_concept_id')
              .whereRef('value_descendants.descendant_id', '=', 'patient_records.value_snomed_concept_id'),
          ),
        ])
      )
      .select([
        'patient_records.id as finding_id',
        'rule_due_to_findings.rule_id',
        'due_to_s_expression',
        'rule_due_to_findings.always_applies_if_present',
      ])

    const by_finding_sites_query = trx.selectFrom('rules')
      .innerJoin('rule_due_to_finding_sites', 'rules.id', 'rule_due_to_finding_sites.rule_id')
      .innerJoin('patient_records', (join) => join.onTrue())
      .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
      .where('rules.age_determinations', '@>', sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`)
      .where('patient_records.id', 'in', positive_record_ids)
      .where((eb) =>
        eb.or([
          eb.exists(
            trx.selectFrom('patient_records as finding_sites')
              .innerJoin('patient_record_qualifiers', 'finding_sites.id', 'patient_record_qualifiers.id')
              .innerJoin(
                'snomed_concept_active_descendants_realized as dest_descendants',
                (join) =>
                  join
                    .onRef('dest_descendants.descendant_id', '=', 'finding_sites.value_snomed_concept_id')
                    .on('dest_descendants.ancestor_id', '=', eb.ref('rule_due_to_finding_sites.value_snomed_concept_id')),
              )
              .where('patient_record_qualifiers.qualifies_record_id', '=', eb.ref('patient_records.id'))
              .where('finding_sites.specific_snomed_concept_id', '=', FINDING_SITE.id),
          ),
          eb.exists(
            trx.selectFrom('snomed_relationship')
              .where('snomed_relationship.active', '=', true)
              .where(
                'snomed_relationship.type_id',
                '=',
                FINDING_SITE.id,
              )
              .where(
                'snomed_relationship.source_id',
                '=',
                eb.ref('patient_records.specific_snomed_concept_id'),
              )
              .innerJoin(
                'snomed_concept_active_descendants_realized as dest_descendants',
                (join) =>
                  join
                    .onRef('dest_descendants.descendant_id', '=', 'snomed_relationship.destination_id')
                    .on('dest_descendants.ancestor_id', '=', eb.ref('rule_due_to_finding_sites.value_snomed_concept_id')),
              ),
          ),
        ])
      )
      .select([
        'patient_records.id as finding_id',
        'rule_due_to_finding_sites.rule_id',
        'due_to_s_expression',
        'rule_due_to_finding_sites.always_applies_if_present',
      ])

    const by_measurements_query = trx.selectFrom('rules')
      .innerJoin('rule_due_to_measurements', 'rules.id', 'rule_due_to_measurements.rule_id')
      .innerJoin('patient_records', 'patient_records.specific_snomed_concept_id', 'rule_due_to_measurements.specific_snomed_concept_id')
      .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
      .innerJoin('patient_measurements', 'patient_records.id', 'patient_measurements.id')
      .where('rules.age_determinations', '@>', sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`)
      .where('patient_records.id', 'in', positive_record_ids)
      .where((eb) =>
        eb.or([
          eb.and([
            eb('rule_due_to_measurements.comparator', '=', '>'),
            eb('patient_measurements.value', '>', eb.ref('rule_due_to_measurements.value')),
          ]),
          eb.and([
            eb('rule_due_to_measurements.comparator', '=', '>='),
            eb('patient_measurements.value', '>=', eb.ref('rule_due_to_measurements.value')),
          ]),
          eb.and([
            eb('rule_due_to_measurements.comparator', '=', '<'),
            eb('patient_measurements.value', '<', eb.ref('rule_due_to_measurements.value')),
          ]),
          eb.and([
            eb('rule_due_to_measurements.comparator', '=', '<='),
            eb('patient_measurements.value', '<=', eb.ref('rule_due_to_measurements.value')),
          ]),
        ])
      )
      .select([
        'patient_records.id as finding_id',
        'rule_due_to_measurements.rule_id',
        'due_to_s_expression',
        'rule_due_to_measurements.always_applies_if_present',
      ])

    return trx.with('matching_rule_findings', () =>
      by_findings_query
        .unionAll(by_finding_sites_query)
        .unionAll(by_measurements_query))
      .selectFrom('matching_rule_findings')
      .selectAll('matching_rule_findings')
      .leftJoin('tasks', 'rule_id', 'tasks.id')
      .leftJoin('system_priority_evaluations', 'rule_id', 'system_priority_evaluations.id')
      .leftJoin('system_diagnosis_rules', 'rule_id', 'system_diagnosis_rules.id')
      .leftJoin(
        'snomed_inferred_canonical_name_and_category as diagnosis_snomed_concept',
        'system_diagnosis_rules.snomed_concept_id',
        'diagnosis_snomed_concept.id',
      )
      .select((eb) => [
        eb.case()
          .when('tasks.id', 'is not', null)
          .then(jsonBuildObject({
            type: literalString('task' as const),
          }))
          .when('system_priority_evaluations.id', 'is not', null)
          .then(jsonBuildObject({
            type: literalString('system_priority_evaluation' as const),
            priority: eb.ref('system_priority_evaluations.priority').$notNull(),
          }))
          .when('system_diagnosis_rules.id', 'is not', null)
          .then(jsonBuildObject({
            type: literalString('system_diagnosis_rule' as const),
            snomed_concept: jsonBuildObject({
              id: asText(eb, 'system_diagnosis_rules.snomed_concept_id').$notNull(),
              name: eb.ref('diagnosis_snomed_concept.name').$notNull(),
              category: eb.ref('diagnosis_snomed_concept.category').$notNull(),
            }),
            certainty: eb.ref('system_diagnosis_rules.certainty').$notNull(),
          }))
          .end().$notNull().as('rule_effect'),
      ])
      .$if(type === 'task', (qb) => qb.where('tasks.id', 'is not', null))
      .$if(type === 'system_diagnosis_rule', (qb) => qb.where('system_diagnosis_rules.id', 'is not', null))
      .$if(type === 'system_priority_evaluation', (qb) => qb.where('system_priority_evaluations.id', 'is not', null))
  },

  formatResult: identity,

  async getApplicableBasedOnNewRecords(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, patient_age_determination, /*procedure_id, */ records: findings }: NewRecordsToConsider,
    type?: 'task' | 'system_priority_evaluation' | 'system_diagnosis_rule',
  ): Promise<string | ApplicableRule[]> {
    if (!patient_age_determination) return 'Skipped: patient age determination is unknown'

    const positive_record_ids = findings
      .filter((f) => f.existence === 'Yes')
      .map((f) => f.id)

    if (arrayIsEmpty(positive_record_ids)) return 'Skipped: no positive findings to check'

    const tasks_matching_some_finding = await rules.findAll(trx, {
      patient_id,
      patient_age_determination,
      positive_record_ids,
      type,
    })

    const all_tasks = groupBy(tasks_matching_some_finding, 'rule_id').values().toArray()

    const parsed = all_tasks.map((findings) => ({
      findings,
      // TODO The uniq could be removed probably if upstream we enforce uniqueness
      matching_finding_ids: uniq(findings.map((finding) => finding.finding_id)),
      certainly_applies: findings.some((finding) => finding.always_applies_if_present),
      due_to: parseWithSchema(findings[0].due_to_s_expression, any_query_evidence),
    }))

    const [certain, uncertain] = partition(parsed, (t) => t.certainly_applies)

    console.log({
      certain: certain.map((r) => r.findings[0].rule_id),
      uncertain: uncertain.map((r) => r.findings[0].rule_id),
    })

    const certain_results = certain.map(({ findings, matching_finding_ids, due_to }) => ({
      id: findings[0].rule_id,
      description: findings[0].rule_id,
      rule_effect: findings[0].rule_effect,
      matching_finding_ids,
      due_to,
    }))

    const due_to_nodes = uncertain.map((t) => t.due_to)
    const evidence_results = await s_expression_evidence.evaluateMultiple(trx, { patient_id }, due_to_nodes)

    const uncertain_results = compactMap(uncertain, ({ findings, due_to }) => {
      const result = exists(evidence_results.get(due_to))
      return result.satisfies && {
        id: findings[0].rule_id,
        description: findings[0].rule_id,
        rule_effect: findings[0].rule_effect,
        matching_finding_ids: result.contributing_records,
        due_to,
      }
    })

    return [...certain_results, ...uncertain_results]
  },
})
