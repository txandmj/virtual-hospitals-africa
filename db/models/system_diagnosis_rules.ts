import { assert } from 'std/assert/assert.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { buildExpression, EXPRESSION_BUILDERS } from './s_expression.ts'
import { ApplicableRule, ApplicableRuleEffectSystemSystemDiagnosisRule, RuleRunnerInput, TrxOrDb } from '../../types.ts'
import { blankSelection, success_true } from '../helpers.ts'
import { DONE, EVIDENCE_OF_CONTEXTUAL_QUALIFIER, RELATIONSHIP, TO_BE_DONE } from '../../shared/snomed_concepts.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { Lang, system_diagnosis_rule } from '../../shared/s_expression_schemas.ts'
import { SYSTEM_DIAGNOSIS_RULES_LISP } from '../../s_expression/system_diagnosis_rules.ts'
import generateUUID from '../../util/uuid.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import isKeyOf from '../../util/isKeyOf.ts'
import { events } from './events.ts'
import { CERTAINTY_QUALIFIER_TO_CONCEPT, diagnosisToEvaluation } from '../../shared/diagnosis.ts'
import { rules } from './rules.ts'
import isString from '../../util/isString.ts'
import { JsonValue, SnomedCategory } from '../../db.d.ts'
import { exists } from '../../util/exists.ts'
import { pMap } from '../../util/inParallel.ts'
import compact from '../../util/compact.ts'
import uniq from '../../util/uniq.ts'
import compactMap from '../../util/compactMap.ts'
import { groupBy } from '../../util/groupBy.ts'
import { logJSONToFileIfOnServer } from '../../util/logJSONToFileIfOnServer.ts'
import { getTaskById } from '../../shared/tasks.ts'
import { allEvidenceToLookFor } from './s_expression_evidence.ts'
import { isCheckFor } from './additional_tasks.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { asNormalFormSExpression } from '../../shared/patient_records.ts'
import { patient_findings } from './patient_findings.ts'

export const SYSTEM_DIAGNOSIS_RULES_PARSED = SYSTEM_DIAGNOSIS_RULES_LISP.map((d) => parseWithSchema(d, system_diagnosis_rule))

const concept_to_certainty_qualifier_map = Object.fromEntries(
  Object.entries(CERTAINTY_QUALIFIER_TO_CONCEPT).map(([certainty, concept]) => [concept.name, certainty]),
) as Record<string, keyof typeof CERTAINTY_QUALIFIER_TO_CONCEPT>

const CERTAINTY_ORDER: Record<ApplicableRuleEffectSystemSystemDiagnosisRule['certainty'], number> = {
  definite: 4,
  probable: 3,
  equivocal: 2,
  possible: 1,
  improbable: 0,
}

type PresentDiagnosis = {
  id: string
  certainty: 'definite' | 'probable' | 'equivocal' | 'possible' | 'improbable'
}

type InsertDiagnosisResult = {
  certainty: 'definite' | 'probable' | 'equivocal' | 'possible' | 'improbable'
  record_id: string
  specific_snomed_concept: { name: string; category: SnomedCategory }
  result: 'already_present' | 'inserted'
}

function presentDiagnosis(
  present_diagnosis: {
    id: string
    value: JsonValue
  } | undefined,
) {
  if (!present_diagnosis) return
  assert(isObjectLike(present_diagnosis.value))
  assert(isKeyOf(present_diagnosis.value.name, concept_to_certainty_qualifier_map))
  const certainty = concept_to_certainty_qualifier_map[present_diagnosis.value.name]
  return { id: present_diagnosis.id, certainty }
}

function shouldInsertNewDiagnosisAsPresentDiagnosisIsNonExistentOrLowerCertainty(
  present_diagnosis: PresentDiagnosis | undefined,
  rule_effect: ApplicableRuleEffectSystemSystemDiagnosisRule,
) {
  if (!present_diagnosis) return true
  switch (present_diagnosis.certainty) {
    case 'definite':
      return false
    case 'probable':
      return rule_effect.certainty === 'definite'
    // While possible is a "higher" certainty
    // improbable is the result of our having ruled out the possible diagnosis
    // so we DO NOT insert one anew
    case 'improbable':
      return ['probable', 'definite'].includes(rule_effect.certainty)
    case 'equivocal':
      return ['probable', 'improbable', 'definite'].includes(rule_effect.certainty)
    case 'possible':
      return rule_effect.certainty !== 'possible'
  }
}

type InsertedDiagnosis = {
  record_id: string
  specific_snomed_concept_id: string
  value_snomed_concept_id: string
}

export const system_diagnosis_rules = {
  async insertOne(
    trx: TrxOrDb,
    {
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      matching_finding_ids,
      diagnosis_node,
    }: Pick<RuleRunnerInput, 'patient_id' | 'patient_encounter_id' | 'patient_age_determination'> & {
      matching_finding_ids: string[]
      diagnosis_node: ReturnType<typeof diagnosisToEvaluation>
    },
  ): Promise<InsertedDiagnosis> {
    assert(diagnosis_node.value_snomed_concept)
    const evaluation_id = generateUUID()
    const relations = matching_finding_ids.map((record_id) => ({
      id: generateUUID(),
      source_id: evaluation_id,
      destination_id: record_id,
    }))

    const inserted = await patient_evaluations.insertOneNestedQuery(trx, {
      evaluation_id,
      patient_id,
      patient_encounter_id,
      evaluation: diagnosis_node,
      by_system: true,
    }).with(
      'inserting_relation_patient_records',
      (qb) =>
        relations.length
          ? qb.insertInto('patient_records').values(relations.map(({ id }) => ({
            id,
            patient_id,
            patient_encounter_id,
            root_snomed_concept_id: RELATIONSHIP.id,
            specific_snomed_concept_id: EVIDENCE_OF_CONTEXTUAL_QUALIFIER.id,
          })))
          : blankSelection(qb),
    ).with(
      'inserting_relations',
      (qb) => relations.length ? qb.insertInto('patient_record_relations').values(relations) : blankSelection(qb),
    )
      .selectFrom('inserting_record')
      .select((eb) => [
        success_true,
        'inserting_record.id as record_id',
        'inserting_record.specific_snomed_concept_id',
        eb.ref('inserting_record.value_snomed_concept_id').$notNull().as('value_snomed_concept_id'),
      ]).executeTakeFirstOrThrow()

    await events.insert(
      trx,
      {
        type: 'SystemDiagnosisCreated',
        data: {
          patient_id,
          patient_encounter_id,
          patient_age_determination: exists(patient_age_determination),
          evaluation_id,
        },
      },
    )

    assert(inserted.value_snomed_concept_id)
    return inserted
  },
  insertPositiveDiagnoses(
    trx: TrxOrDb,
    input: RuleRunnerInput & {
      procedure_id: string
    },
    rules_result: string | ApplicableRule[],
  ): Promise<InsertDiagnosisResult[]> {
    if (isString(rules_result)) return Promise.resolve([])

    const diagnosis_rules = rules_result.filter((r): r is ApplicableRule & { rule_effect: ApplicableRuleEffectSystemSystemDiagnosisRule } =>
      r.rule_effect.type === 'system_diagnosis_rule'
    )
    const rules_grouped = groupBy(diagnosis_rules, (rule) => rule.rule_effect.snomed_concept.id)
    return pMap([...rules_grouped.values()], async (rules_for_concept) => {
      const highest_certainty_rule = rules_for_concept.reduce((best, rule) =>
        CERTAINTY_ORDER[rule.rule_effect.certainty] > CERTAINTY_ORDER[best.rule_effect.certainty] ? rule : best
      )
      const matching_finding_ids = uniq(rules_for_concept.flatMap((r) => r.matching_finding_ids))
      const diagnosis_node = diagnosisToEvaluation({
        snomed_concept: {
          atom: 'snomed_concept',
          ...highest_certainty_rule.rule_effect.snomed_concept,
        },
        certainty_qualifier: highest_certainty_rule.rule_effect.certainty,
      })

      const already_present_diagnosis = await EXPRESSION_BUILDERS.evaluation(
        trx,
        input,
        diagnosis_node,
      ).select([
        'patient_records_aggregated.value',
      ])
        .orderBy('patient_records_aggregated.created_at', 'desc')
        .limit(1)
        .executeTakeFirst()
        .then(presentDiagnosis)

      const do_insert = shouldInsertNewDiagnosisAsPresentDiagnosisIsNonExistentOrLowerCertainty(already_present_diagnosis, highest_certainty_rule.rule_effect)

      if (!do_insert) {
        assert(already_present_diagnosis)
        return {
          certainty: already_present_diagnosis.certainty,
          record_id: already_present_diagnosis.id,
          specific_snomed_concept: exists(diagnosis_node.specific_snomed_concept),
          result: 'already_present' as const,
        }
      }

      const inserted_diagnosis = await system_diagnosis_rules.insertOne(trx, {
        ...input,
        diagnosis_node,
        matching_finding_ids,
      })

      return {
        certainty: highest_certainty_rule.rule_effect.certainty,
        record_id: inserted_diagnosis.record_id,
        specific_snomed_concept: exists(diagnosis_node.specific_snomed_concept),
        result: 'inserted' as const,
      }
    }).then(compact)
  },
  // TODO: revisit this whole idea
  async insertImprobableDiagnoses(
    trx: TrxOrDb,
    input: RuleRunnerInput & {
      procedure_id: string
    },
    _inserted_diagnoses_results: InsertDiagnosisResult[],
  ) {
    const possible_diagnosis_tasks_now_completed_with_no_other_diagnoses = await trx
      .selectFrom('patient_record_relations as done_relations')
      .innerJoin('patient_records_aggregated as done_records', 'done_relations.id', 'done_records.id')
      .innerJoin('patient_records_aggregated as task_records', 'done_relations.destination_id', 'task_records.id')
      .innerJoin('patient_record_relations as due_to_relations', 'due_to_relations.source_id', 'task_records.id')
      .innerJoin('patient_records_aggregated as due_to_records', 'due_to_records.id', 'due_to_relations.id')
      .innerJoin('patient_records_aggregated as diagnosis_records', 'diagnosis_records.id', 'due_to_relations.destination_id')
      .leftJoin('patient_records_aggregated as other_diagnosis', (join) =>
        join
          .onRef('other_diagnosis.specific_snomed_concept_id', '=', 'diagnosis_records.specific_snomed_concept_id')
          .on(
            'other_diagnosis.id',
            'in',
            buildExpression(trx, input, diagnosisToEvaluation({ certainty_qualifier: 'probable' }))
              .union(buildExpression(trx, input, diagnosisToEvaluation({ certainty_qualifier: 'improbable' })))
              .union(buildExpression(trx, input, diagnosisToEvaluation({ certainty_qualifier: 'equivocal' })))
              .union(buildExpression(trx, input, diagnosisToEvaluation({ certainty_qualifier: 'definite' }))),
          ))
      .where('task_records.specific_snomed_concept_id', '=', TO_BE_DONE.id)
      .where('done_relations.source_id', '=', input.procedure_id)
      .where('done_records.specific_snomed_concept_id', '=', DONE.id)
      .where(
        'diagnosis_records.id',
        'in',
        buildExpression(
          trx,
          input,
          diagnosisToEvaluation({ certainty_qualifier: 'possible' }),
        ),
      )
      .where('other_diagnosis.id', 'is', null)
      .selectAll('diagnosis_records')
      .select('task_records.value as task_value')
      .execute()

    if (!possible_diagnosis_tasks_now_completed_with_no_other_diagnoses.length) return []

    //       .then(tasks => tasks.map(
    //     possible_diagnosis => {

    //     }
    //   )
    // )

    // logJSONToFileIfOnServer(possible_diagnoses_now_completed)

    // // While we have filtered out diagnoses just made, that's not a guarantee that there aren't already diaganoses in the database, so another pass is needed below
    // const possible_diagnoses_now_maybe_improbable = possible_diagnoses_now_completed.filter(({ specific_snomed_concept_name, specific_snomed_concept_category }) => {
    //   const inserted_diagnosis_for_same_condition = inserted_diagnoses_results.some(inserted_diagnosis_result =>
    //     inserted_diagnosis_result.specific_snomed_concept.name === specific_snomed_concept_name &&
    //     inserted_diagnosis_result.specific_snomed_concept.category === specific_snomed_concept_category
    //   )
    //   return !inserted_diagnosis_for_same_condition
    // })

    const no_record_ids = compactMap(input.records, (record) => record.existence === 'No' && record.id)
    const no_findings = await patient_findings.getByIds(trx, no_record_ids, { include_negative: true })

    logJSONToFileIfOnServer(
      no_findings.map((no_finding) => ({
        ...no_finding,
        as_normal_form_s_expression: asNormalFormSExpression(no_finding),
      })),
    )

    return pMap(groupBy(possible_diagnosis_tasks_now_completed_with_no_other_diagnoses, 'specific_snomed_concept_id').values(), (possible_diagnosis_tasks) => {
      const [possible_diagnosis] = possible_diagnosis_tasks
      const diagnosis_node = diagnosisToEvaluation({
        snomed_concept: {
          atom: 'snomed_concept',
          name: possible_diagnosis.specific_snomed_concept_name,
          category: possible_diagnosis.specific_snomed_concept_category,
        },
        certainty_qualifier: 'improbable',
      })

      const matching_finding_ids = new Set<string>()
      for (const possible_diagnosis_task of possible_diagnosis_tasks) {
        assert(possible_diagnosis_task.task_value)
        assert(isObjectLike(possible_diagnosis_task.task_value))
        assert(isString(possible_diagnosis_task.task_value.task_id))
        const { to_be_done } = getTaskById(possible_diagnosis_task.task_value.task_id)

        if (isCheckFor(to_be_done)) {
          for (const finding of to_be_done.value as unknown as Lang['finding'][]) {
            for (const evidence of allEvidenceToLookFor(finding)) {
              for (const record of no_findings) {
                if (
                  inverseSExpression(evidence) === asNormalFormSExpression({
                    ...record,
                    value: null,
                  })
                ) {
                  matching_finding_ids.add(record.id)
                }
              }
            }
          }
        }
      }

      logJSONToFileIfOnServer({
        no_findings,
        possible_diagnosis_tasks,
      })

      return system_diagnosis_rules.insertOne(trx, {
        ...input,
        diagnosis_node,
        matching_finding_ids: Array.from(matching_finding_ids),
      })
    })
  },
  async insertSystemDiagnosesIfNotAlreadyIdentified(
    trx: TrxOrDb,
    input: RuleRunnerInput & {
      procedure_id: string
    },
  ) {
    const rules_result = await rules.getApplicableBasedOnNewRecords(trx, input, 'system_diagnosis_rule')
    const inserted_diagnoses = await system_diagnosis_rules.insertPositiveDiagnoses(trx, input, rules_result)
    const improbable_diagnoses = await system_diagnosis_rules.insertImprobableDiagnoses(trx, input, inserted_diagnoses)

    return compact([
      inserted_diagnoses.length && `Inserted ${inserted_diagnoses.length} diagnosis(es): ${inserted_diagnoses.map((d) => d.record_id).join(', ')}`,
      improbable_diagnoses.length &&
      `Inserted ${improbable_diagnoses.length} improbable diagnosis(es): ${improbable_diagnoses.map((d) => d.record_id).join(', ')}`,
    ]).join('\n') || (
      isString(rules_result) ? rules_result : 'No new system diagnoses to insert'
    )
  },
}
