import { sql } from 'kysely'
import { AgeDetermination, ApplicableRule, NewRecordsToConsider, NewRecordsToConsiderWithSatisfyingDueToIds, TrxOrDbOrQueryCreator } from '../../types.ts'
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
    positive_records_satisfying_some_due_to,
    type,
  }: {
    patient_id: string
    patient_age_determination: AgeDetermination
    positive_records_satisfying_some_due_to: RecordsSatisfyingDueToIds[]
    type?: 'task' | 'system_priority_evaluation' | 'system_diagnosis_rule'
  }) {
    assert(positive_records_satisfying_some_due_to.length)

    return trx.selectFrom('rules')
      .innerJoin('rule_due_to', 'rules.id', 'rule_due_to.rule_id')
      .where('rules.age_determinations', '@>', sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`)
      .where('patient_records.id', 'in', positive_record_ids)
      .select([
        'patient_records.id as finding_id',
        'rule_due_to_finding_sites.rule_id',
        'due_to_s_expression',
        'rule_due_to_finding_sites.always_applies_if_present',
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
    { patient_id, patient_age_determination, /*procedure_id, */ records }: NewRecordsToConsiderWithSatisfyingDueToIds,
    type?: 'task' | 'system_priority_evaluation' | 'system_diagnosis_rule',
  ): Promise<string | ApplicableRule[]> {

    const positive_records_satisfying_some_due_to = records
      .filter((r) => r.existence === 'Yes')
      .filter((r) => !!r.satisfying_due_to_ids.length)
      

    if (arrayIsEmpty(positive_records_satisfying_some_due_to)) return 'Skipped: no positive findings satisfying some due_to'

    const rules_matching_some_finding = await rules.findAll(trx, {
      patient_id,
      patient_age_determination,
      positive_records_satisfying_some_due_to,
      type,
    })

    const all_rules = groupBy(rules_matching_some_finding, 'rule_id').values().toArray()

    const parsed = all_rules.map((findings) => ({
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
