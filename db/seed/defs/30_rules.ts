import { define } from '../define.ts'
import { TASKS } from '../../../shared/tasks.ts'

import type { Lang, QueryableEvidenceNode } from '../../../shared/s_expression_schemas.ts'
import { assert } from 'std/assert/assert.ts'
import { Comparator } from '../../../db.d.ts'
import { activeConditionAsOr } from '../../../shared/s_expression_active_condition_as_or.ts'
import { diagnosisToEvaluation } from '../../../shared/diagnosis.ts'
import { snomedConceptId } from '../../models/s_expression_snomed_concepts.ts'
import { inverseSExpression } from '../../../shared/s_expression_inverse.ts'
import { forEach, pMap } from '../../../util/inParallel.ts'
import { TrxOrDb } from '../../../types.ts'
import { SYSTEM_DIAGNOSIS_RULES_PARSED } from '../../models/system_diagnosis_rules.ts'
import { SYSTEM_PRIORITY_EVALUATIONS_PARSED } from '../../models/system_priority_evaluations.ts'

type DueToInsert =
  | ({
    type: 'finding'
    s_expression: string
    root_snomed_concept: null | Lang['snomed_concept']
    specific_snomed_concept: Lang['snomed_concept']
    value_snomed_concept: null | Lang['snomed_concept']
    always_applies_if_present: boolean
  } & Lang['finding' | 'evaluation'])
  | {
    type: 'finding_site'
    s_expression: string
    value_snomed_concept: Lang['snomed_concept']
    always_applies_if_present: boolean
  }
  | {
    type: 'measurement'
    s_expression: string
    specific_snomed_concept: Lang['snomed_concept']
    always_applies_if_present: boolean
    value: string
    comparator: Comparator
  }

function dueToInsert(due_to: QueryableEvidenceNode): DueToInsert[] {
  switch (due_to.atom) {
    case 'finding': {
      assert(!due_to.exact, 'exact not supported')
      if (!due_to.specific_snomed_concept) {
        assert(due_to.root_snomed_concept?.name === 'Clinical finding')
        assert(!due_to.qualifiers.length)
        assert(due_to.attributes.length === 1)
        assert(due_to.attributes[0].specific_snomed_concept.name === 'Finding site')
        assert(due_to.attributes[0].value.atom === 'snomed_concept')
        return [{
          type: 'finding_site',
          s_expression: inverseSExpression(due_to),
          value_snomed_concept: due_to.attributes[0].value,
          always_applies_if_present: true,
        }]
      }
      assert(due_to.specific_snomed_concept, `Must have a specific_snomed_concept\n${inverseSExpression(due_to)}`)
      const always_applies_if_present = !due_to.attributes.length && !due_to.qualifiers.length && !due_to.excluding.length
      return [{
        ...due_to,
        type: 'finding',
        s_expression: inverseSExpression(due_to),
        root_snomed_concept: due_to.root_snomed_concept,
        specific_snomed_concept: due_to.specific_snomed_concept,
        value_snomed_concept: due_to.value_snomed_concept,
        always_applies_if_present,
      }]
    }
    case 'active_condition': {
      return dueToInsert(activeConditionAsOr(due_to))
    }
    case 'evaluation': {
      assert(due_to.specific_snomed_concept, `Must have a specific_snomed_concept\n${inverseSExpression(due_to)}`)
      const always_applies_if_present = !due_to.evaluates && !due_to.attributes.length && !due_to.qualifiers.length
      return [{
        ...due_to,
        type: 'finding',
        s_expression: inverseSExpression(due_to),
        root_snomed_concept: due_to.root_snomed_concept,
        specific_snomed_concept: due_to.specific_snomed_concept,
        value_snomed_concept: due_to.value_snomed_concept,
        always_applies_if_present,
      }]
    }
    case 'diagnosis': {
      return dueToInsert(diagnosisToEvaluation(due_to))
    }
    case '<':
    case '<=':
    case '=':
    case '>':
    case '>=': {
      assert(due_to.type === 'measurement', 'Only measurement comparators supported in due_to')
      return [{
        type: 'measurement',
        s_expression: inverseSExpression(due_to),
        specific_snomed_concept: due_to.measurement.snomed_concept,
        comparator: due_to.atom,
        value: due_to.value.toString(),
        always_applies_if_present: true,
      }]
    }
    case 'or': {
      const all_to_insert = due_to.expressions.flatMap(dueToInsert)
      const all_always_apply = all_to_insert.every((to_insert) => to_insert.always_applies_if_present)
      if (all_always_apply) return all_to_insert
      return all_to_insert.map((to_insert) => ({
        ...to_insert,
        always_applies_if_present: false,
      }))
    }
    case 'and':
    case 'any2':
      return due_to.expressions.flatMap(dueToInsert).map((to_insert) => ({
        ...to_insert,
        always_applies_if_present: false,
      }))
    case 'not':
      return []
    default:
      throw new Error(`Not supported ${due_to.atom}`)
  }
}

type InsertedJunctionIds = {
  rule_due_to_finding_ids: string[]
  rule_due_to_finding_site_ids: string[]
  rule_due_to_measurement_ids: string[]
}

async function insertRule(
  trx: TrxOrDb,
  rule: (
    | typeof TASKS
    | typeof SYSTEM_PRIORITY_EVALUATIONS_PARSED
    | typeof SYSTEM_DIAGNOSIS_RULES_PARSED
  )[number],
): Promise<InsertedJunctionIds> {
  console.log(`Inserting ${rule.description}...`)
  // TODO rule description will be distinct for manage tasks
  const rule_id = rule.description
  const due_to_insert = dueToInsert(rule.due_to)

  assert(due_to_insert.length)

  await trx.insertInto('rules')
    .values({
      id: rule_id,
      description: rule.description,
      age_determinations: rule.ages,
      due_to_s_expression: inverseSExpression(rule.due_to),
    })
    .onConflict((oc) =>
      oc.column('id').doUpdateSet({
        description: (eb) => eb.ref('excluded.description'),
        age_determinations: (eb) => eb.ref('excluded.age_determinations'),
        due_to_s_expression: (eb) => eb.ref('excluded.due_to_s_expression'),
      })
    )
    .returning('id')
    .executeTakeFirstOrThrow()

  const findings = due_to_insert.filter((d): d is Extract<DueToInsert, { type: 'finding' }> => d.type === 'finding')
  const finding_sites = due_to_insert.filter((d): d is Extract<DueToInsert, { type: 'finding_site' }> => d.type === 'finding_site')
  const measurements = due_to_insert.filter((d): d is Extract<DueToInsert, { type: 'measurement' }> => d.type === 'measurement')

  const rule_due_to_finding_ids: string[] = []
  const rule_due_to_finding_site_ids: string[] = []
  const rule_due_to_measurement_ids: string[] = []

  if (findings.length) {
    const due_to_finding_ids = await pMap(findings, async (finding) => {
      const { id } = await trx.insertInto('due_to')
        .values({ s_expression: finding.s_expression })
        .onConflict((oc) => oc.column('s_expression').doUpdateSet({ s_expression: (eb) => eb.ref('excluded.s_expression') }))
        .returning('id')
        .executeTakeFirstOrThrow()
      return trx.insertInto('due_to_findings')
        .values({
          id,
          root_snomed_concept_id: finding.root_snomed_concept ? snomedConceptId(finding.root_snomed_concept) : null,
          specific_snomed_concept_id: snomedConceptId(finding.specific_snomed_concept),
          value_snomed_concept_id: finding.value_snomed_concept ? snomedConceptId(finding.value_snomed_concept) : null,
        })
        .onConflict((oc) =>
          oc.column('id').doUpdateSet({
            root_snomed_concept_id: (eb) => eb.ref('excluded.root_snomed_concept_id'),
            specific_snomed_concept_id: (eb) => eb.ref('excluded.specific_snomed_concept_id'),
            value_snomed_concept_id: (eb) => eb.ref('excluded.value_snomed_concept_id'),
          })
        )
        .returning('id')
        .executeTakeFirstOrThrow()
    }, { concurrency: 1 })

    const rows = await trx.insertInto('rule_due_to_findings')
      .values(findings.map((finding, i) => ({
        rule_id,
        due_to_finding_id: due_to_finding_ids[i].id,
        always_applies_if_present: finding.always_applies_if_present,
      })))
      .returning('id')
      .execute()
    rule_due_to_finding_ids.push(...rows.map((r) => r.id))
  }

  if (finding_sites.length) {
    await pMap(finding_sites, async (finding_site) => {
      const { id } = await trx.insertInto('due_to')
        .values({ s_expression: finding_site.s_expression })
        .onConflict((oc) => oc.column('s_expression').doUpdateSet({ s_expression: (eb) => eb.ref('excluded.s_expression') }))
        .returning('id')
        .executeTakeFirstOrThrow()
      await trx.insertInto('due_to_finding_sites')
        .values({
          id,
          s_expression: finding_site.s_expression,
          value_snomed_concept_id: snomedConceptId(finding_site.value_snomed_concept),
        })
        .onConflict((oc) =>
          oc.column('id').doUpdateSet({
            s_expression: (eb) => eb.ref('excluded.s_expression'),
            value_snomed_concept_id: (eb) => eb.ref('excluded.value_snomed_concept_id'),
          })
        )
        .execute()
    }, { concurrency: 1 })

    const rows = await trx.insertInto('rule_due_to_finding_sites')
      .values(finding_sites.map((finding_site) => ({
        rule_id,
        value_snomed_concept_id: snomedConceptId(finding_site.value_snomed_concept),
        always_applies_if_present: finding_site.always_applies_if_present,
      })))
      .returning('id')
      .execute()
    rule_due_to_finding_site_ids.push(...rows.map((r) => r.id))
  }

  if (measurements.length) {
    const due_to_measurement_ids = await pMap(measurements, async (measurement) => {
      const { id } = await trx.insertInto('due_to')
        .values({ s_expression: measurement.s_expression })
        .onConflict((oc) => oc.column('s_expression').doUpdateSet({ s_expression: (eb) => eb.ref('excluded.s_expression') }))
        .returning('id')
        .executeTakeFirstOrThrow()
      return trx.insertInto('due_to_measurements')
        .values({
          id,
          root_snomed_concept_id: null,
          specific_snomed_concept_id: snomedConceptId(measurement.specific_snomed_concept),
          comparator: measurement.comparator,
          value: measurement.value,
        })
        .onConflict((oc) =>
          oc.column('id').doUpdateSet({
            specific_snomed_concept_id: (eb) => eb.ref('excluded.specific_snomed_concept_id'),
            comparator: (eb) => eb.ref('excluded.comparator'),
            value: (eb) => eb.ref('excluded.value'),
          })
        )
        .returning('id')
        .executeTakeFirstOrThrow()
    }, { concurrency: 1 })

    const rows = await trx.insertInto('rule_due_to_measurements')
      .values(measurements.map((measurement, i) => ({
        rule_id,
        due_to_measurement_id: due_to_measurement_ids[i].id,
        always_applies_if_present: measurement.always_applies_if_present,
      })))
      .returning('id')
      .execute()
    rule_due_to_measurement_ids.push(...rows.map((r) => r.id))
  }

  return { rule_due_to_finding_ids, rule_due_to_finding_site_ids, rule_due_to_measurement_ids }
}

export default define([
  'rules',
  'due_to',
  'due_to_findings',
  'due_to_finding_sites',
  'due_to_measurements',
  'rule_due_to_findings',
  'rule_due_to_finding_sites',
  'rule_due_to_measurements',
  'tasks',
  'system_diagnosis_rules',
  'system_priority_evaluations',
], async (trx) => {
  const rule_ids: string[] = []
  const rule_due_to_finding_ids: string[] = []
  const rule_due_to_finding_site_ids: string[] = []
  const rule_due_to_measurement_ids: string[] = []

  await forEach(TASKS, async (task) => {
    const junction_ids = await insertRule(trx, task)
    rule_ids.push(task.description)
    rule_due_to_finding_ids.push(...junction_ids.rule_due_to_finding_ids)
    rule_due_to_finding_site_ids.push(...junction_ids.rule_due_to_finding_site_ids)
    rule_due_to_measurement_ids.push(...junction_ids.rule_due_to_measurement_ids)

    await trx.insertInto('tasks')
      .values({
        id: task.description,
        to_be_done_s_expression: inverseSExpression(task.to_be_done),
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          to_be_done_s_expression: (eb) => eb.ref('excluded.to_be_done_s_expression'),
        })
      )
      .returning('id')
      .executeTakeFirstOrThrow()
  }, { concurrency: 1 })

  await forEach(SYSTEM_PRIORITY_EVALUATIONS_PARSED, async (system_priority_evaluation) => {
    const junction_ids = await insertRule(trx, system_priority_evaluation)
    rule_ids.push(system_priority_evaluation.description)
    rule_due_to_finding_ids.push(...junction_ids.rule_due_to_finding_ids)
    rule_due_to_finding_site_ids.push(...junction_ids.rule_due_to_finding_site_ids)
    rule_due_to_measurement_ids.push(...junction_ids.rule_due_to_measurement_ids)

    await trx.insertInto('system_priority_evaluations')
      .values({
        id: system_priority_evaluation.description,
        priority: system_priority_evaluation.priority,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          priority: (eb) => eb.ref('excluded.priority'),
        })
      )
      .returning('id')
      .executeTakeFirstOrThrow()
  })

  await forEach(SYSTEM_DIAGNOSIS_RULES_PARSED, async (system_diagnosis_rule) => {
    const junction_ids = await insertRule(trx, system_diagnosis_rule)
    rule_ids.push(system_diagnosis_rule.description)
    rule_due_to_finding_ids.push(...junction_ids.rule_due_to_finding_ids)
    rule_due_to_finding_site_ids.push(...junction_ids.rule_due_to_finding_site_ids)
    rule_due_to_measurement_ids.push(...junction_ids.rule_due_to_measurement_ids)

    await trx.insertInto('system_diagnosis_rules')
      .values({
        id: system_diagnosis_rule.description,
        snomed_concept_id: snomedConceptId(system_diagnosis_rule.diagnosis.snomed_concept),
        certainty: system_diagnosis_rule.diagnosis.certainty_qualifier,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          snomed_concept_id: (eb) => eb.ref('excluded.snomed_concept_id'),
          certainty: (eb) => eb.ref('excluded.certainty'),
        })
      )
      .returning('id')
      .executeTakeFirstOrThrow()
  })

  // Clean up any rows that were not part of this run
  await trx.deleteFrom('rule_due_to_findings')
    .where('id', 'not in', rule_due_to_finding_ids)
    .execute()
  await trx.deleteFrom('rule_due_to_finding_sites')
    .where('id', 'not in', rule_due_to_finding_site_ids)
    .execute()
  await trx.deleteFrom('rule_due_to_measurements')
    .where('id', 'not in', rule_due_to_measurement_ids)
    .execute()
  await trx.deleteFrom('rules')
    .where('id', 'not in', rule_ids)
    .execute()
}, { never_dump: true, always_run: true })
