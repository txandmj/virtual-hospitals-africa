import { assert } from 'std/assert/assert.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { buildExpression, EXPRESSION_BUILDERS } from './s_expression.ts'
import { ApplicableRule, ApplicableRuleEffectSystemSystemDiagnosisRule, RuleRunnerInput, TrxOrDb } from '../../types.ts'
import { blankSelection, debugLog, success_true } from '../helpers.ts'
import { DONE, EVIDENCE_OF_CONTEXTUAL_QUALIFIER, RELATIONSHIP, TO_BE_DONE } from '../../shared/snomed_concepts.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { system_diagnosis_rule } from '../../shared/s_expression_schemas.ts'
import { SYSTEM_DIAGNOSIS_RULES_LISP } from '../../s_expression/system_diagnosis_rules.ts'
import generateUUID from '../../util/uuid.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import isKeyOf from '../../util/isKeyOf.ts'
import { events } from './events.ts'
import { CERTAINTY_QUALIFIER_TO_CONCEPT, diagnosisToEvaluation } from '../../shared/diagnosis.ts'
import { rules } from './rules.ts'
import isString from '../../util/isString.ts'
import { JsonValue } from '../../db.d.ts'
import { exists } from '../../util/exists.ts'
import { pMap } from '../../util/inParallel.ts'
import compact from '../../util/compact.ts'
import compactMap from '../../util/compactMap.ts'
import matching from '../../util/matching.ts'

export const SYSTEM_DIAGNOSIS_RULES_PARSED = SYSTEM_DIAGNOSIS_RULES_LISP.map((d) => parseWithSchema(d, system_diagnosis_rule))

const concept_to_certainty_qualifier_map = Object.fromEntries(
  Object.entries(CERTAINTY_QUALIFIER_TO_CONCEPT).map(([certainty, concept]) => [concept.name, certainty]),
) as Record<string, keyof typeof CERTAINTY_QUALIFIER_TO_CONCEPT>

function shouldInsertNewDiagnosisAsPresentDiagnosisIsNonExistentOrLowerCertainty(
  present_diagnosis: {
    id: string
    value: JsonValue
  } | undefined,
  rule_effect: ApplicableRuleEffectSystemSystemDiagnosisRule,
) {
  if (!present_diagnosis) return true
  assert(isObjectLike(present_diagnosis.value))
  assert(isKeyOf(present_diagnosis.value.name, concept_to_certainty_qualifier_map))
  const certainty = concept_to_certainty_qualifier_map[present_diagnosis.value.name]
  switch (certainty) {
    case 'definite':
    case 'probable':
    case 'improbable':
      return false
    case 'equivocal':
      return ['probable', 'improbable'].includes(rule_effect.certainty)
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
  ): Promise<InsertedDiagnosis[]> {
    if (isString(rules_result)) return Promise.resolve([])
    return pMap(rules_result, async (rule) => {
      assert(rule.rule_effect.type === 'system_diagnosis_rule')
      const diagnosis_node = diagnosisToEvaluation({
        snomed_concept: {
          atom: 'snomed_concept',
          ...rule.rule_effect.snomed_concept,
        },
        certainty_qualifier: rule.rule_effect.certainty,
      })

      const present_diagnosis = await EXPRESSION_BUILDERS.evaluation(
        trx,
        input,
        diagnosis_node,
      ).select([
        'patient_records_aggregated.value',
      ])
        .orderBy('patient_records_aggregated.created_at', 'desc')
        .limit(1)
        .executeTakeFirst()

      const do_insert = shouldInsertNewDiagnosisAsPresentDiagnosisIsNonExistentOrLowerCertainty(present_diagnosis, rule.rule_effect)

      if (!do_insert) return

      return system_diagnosis_rules.insertOne(trx, {
        ...input,
        diagnosis_node,
        matching_finding_ids: rule.matching_finding_ids,
      })
    }).then(compact)
  },
  async insertImprobableDiagnoses(
    trx: TrxOrDb,
    input: RuleRunnerInput & {
      procedure_id: string
    },
    inserted_diagnoses: {
      record_id: string
      specific_snomed_concept_id: string
      value_snomed_concept_id: string
    }[],
  ) {
    debugLog(
      trx
        .selectFrom('patient_record_relations as done_relations')
        .innerJoin('patient_records_aggregated as done_records', 'done_relations.id', 'done_records.id')
        .innerJoin('patient_records_aggregated as task_records', 'done_relations.destination_id', 'task_records.id')
        .innerJoin('patient_record_relations as due_to_relations', 'due_to_relations.source_id', 'task_records.id')
        .innerJoin('patient_records_aggregated as due_to_records', 'due_to_records.id', 'due_to_relations.id')
        .innerJoin('patient_records_aggregated as diagnosis_records', 'diagnosis_records.id', 'due_to_relations.destination_id')
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
        .selectAll('diagnosis_records'),
    )
    const possible_diagnoses_now_completed = await trx
      .selectFrom('patient_record_relations as done_relations')
      .innerJoin('patient_records_aggregated as done_records', 'done_relations.id', 'done_records.id')
      .innerJoin('patient_records_aggregated as task_records', 'done_relations.destination_id', 'task_records.id')
      .innerJoin('patient_record_relations as due_to_relations', 'due_to_relations.source_id', 'task_records.id')
      .innerJoin('patient_records_aggregated as due_to_records', 'due_to_records.id', 'due_to_relations.id')
      .innerJoin('patient_records_aggregated as diagnosis_records', 'diagnosis_records.id', 'due_to_relations.destination_id')
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
      .selectAll('diagnosis_records')
      .execute()

    const possible_diagnoses_now_improbable = possible_diagnoses_now_completed.filter(({ specific_snomed_concept_id }) => {
      const inserted_diagnosis_for_same_condition = inserted_diagnoses.some(matching({ specific_snomed_concept_id }))
      return !inserted_diagnosis_for_same_condition
    })

    return pMap(possible_diagnoses_now_improbable, (possible_diagnosis) => {
      const diagnosis_node = diagnosisToEvaluation({
        snomed_concept: {
          atom: 'snomed_concept',
          name: possible_diagnosis.specific_snomed_concept_name,
          category: possible_diagnosis.specific_snomed_concept_category,
        },
        certainty_qualifier: 'improbable',
      })
      const matching_finding_ids = compactMap(input.records, (record) => record.existence === 'No' && record.id)
      return system_diagnosis_rules.insertOne(trx, {
        ...input,
        diagnosis_node,
        matching_finding_ids,
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

    console.log({ rules_result, inserted_diagnoses, improbable_diagnoses })

    return compact([
      inserted_diagnoses.length && `Inserted ${inserted_diagnoses.length} diagnosis(es): ${inserted_diagnoses.map((d) => d.record_id).join(', ')}`,
      improbable_diagnoses.length &&
      `Inserted ${improbable_diagnoses.length} improbable diagnosis(es): ${improbable_diagnoses.map((d) => d.record_id).join(', ')}`,
    ]).join('\n') || (
      isString(rules_result) ? rules_result : 'No new system diagnoses to insert'
    )
  },
}
