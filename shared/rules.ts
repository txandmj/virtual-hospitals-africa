import { assert } from 'std/assert/assert.ts'
import { AgeDetermination, Comparator } from '../db.d.ts'

import { diagnosisToEvaluation } from './diagnosis.ts'
import { activeConditionAsOr } from './s_expression_active_condition_as_or.ts'
import { inverseSExpression } from './s_expression_inverse.ts'
import { Lang, QueryableEvidenceNode } from './s_expression_schemas.ts'
import findMatching from '../util/findMatching.ts'
import memoize from '../util/memoize.ts'
import { SYSTEM_PRIORITY_EVALUATIONS_PARSED } from './system_priority_evaluations.ts'
import { TASKS } from './tasks.ts'
import { SYSTEM_DIAGNOSIS_RULES_PARSED } from './system_diagnosis_rules.ts'

export type DueToInsert =
  | ({
    type: 'finding'
    s_expression: string
    root_snomed_concept: null | Lang['snomed_concept']
    specific_snomed_concept: Lang['snomed_concept']
    value_snomed_concept: null | Lang['snomed_concept']
    is_somehow_qualified: boolean
    always_applies_if_present: boolean
    history: boolean
  } & Lang['finding' | 'evaluation'])
  | {
    type: 'finding_site'
    s_expression: string
    value_snomed_concept: Lang['snomed_concept']
    is_somehow_qualified?: never
    always_applies_if_present: boolean
    history: boolean
  }
  | {
    type: 'measurement'
    s_expression: string
    specific_snomed_concept: Lang['snomed_concept']
    is_somehow_qualified?: never
    always_applies_if_present: boolean
    value: string
    comparator: Comparator
    history: false
  }

export function dueToInsert(due_to: QueryableEvidenceNode): DueToInsert[] {
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
          history: due_to.history,
        }]
      }
      assert(due_to.specific_snomed_concept, `Must have a specific_snomed_concept\n${inverseSExpression(due_to)}`)
      const is_somehow_qualified = !!(due_to.attributes.length || due_to.qualifiers.length || due_to.excluding.length)
      return [{
        ...due_to,
        type: 'finding',
        s_expression: inverseSExpression(due_to),
        root_snomed_concept: due_to.root_snomed_concept,
        specific_snomed_concept: due_to.specific_snomed_concept,
        value_snomed_concept: due_to.value_snomed_concept,
        is_somehow_qualified,
        always_applies_if_present: !is_somehow_qualified,
        history: due_to.history,
      }]
    }
    case 'active_condition': {
      return dueToInsert(activeConditionAsOr(due_to))
    }
    case 'evaluation': {
      assert(due_to.specific_snomed_concept, `Must have a specific_snomed_concept\n${inverseSExpression(due_to)}`)
      const is_somehow_qualified = !!due_to.evaluates || !!due_to.attributes.length || !!due_to.qualifiers.length
      return [{
        ...due_to,
        type: 'finding',
        s_expression: inverseSExpression(due_to),
        root_snomed_concept: due_to.root_snomed_concept,
        specific_snomed_concept: due_to.specific_snomed_concept,
        value_snomed_concept: due_to.value_snomed_concept,
        is_somehow_qualified,
        always_applies_if_present: !is_somehow_qualified,
        history: false,
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
        history: false,
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
export type AnyRule = (
  | typeof TASKS
  | typeof SYSTEM_PRIORITY_EVALUATIONS_PARSED
  | typeof SYSTEM_DIAGNOSIS_RULES_PARSED
)[number]

export type DueToEntry = {
  s_expression: string
  age_determinations: AgeDetermination[]
  insert: DueToInsert
}

export const ALL_RULES: AnyRule[] = [
  ...TASKS,
  ...SYSTEM_PRIORITY_EVALUATIONS_PARSED,
  ...SYSTEM_DIAGNOSIS_RULES_PARSED,
]

export const getRuleByDescription = memoize((description) => {
  return findMatching(ALL_RULES, { description })
})
