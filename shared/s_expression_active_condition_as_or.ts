import { parseExpressionExpectingAtom } from './s_expression.ts'
import { inverseSExpression } from './s_expression_inverse.ts'
import { Lang } from './s_expression_schemas.ts'
import { STATUS_ATTRIBUTE, YES_QUALIFIER } from './snomed_concepts.ts'

export function activeConditionAsOr({ snomed_concept, possible }: Lang['active_condition']): Lang['or'] {
  const snomed_concept_s_expression = inverseSExpression(snomed_concept)
  const disjuncts = [
    `(clinical_finding ${snomed_concept_s_expression})`,
    `(finding ${STATUS_ATTRIBUTE.s_expression} ${snomed_concept_s_expression} ${YES_QUALIFIER.s_expression})`,
    `(diagnosis ${snomed_concept_s_expression} probable)`,
    `(diagnosis ${snomed_concept_s_expression} definite)`,
  ]
  if (possible) {
    disjuncts.push(
      `(diagnosis ${snomed_concept_s_expression} equivocal)`,
      `(diagnosis ${snomed_concept_s_expression} possible)`,
    )
  }
  const or_expression = `(or ${disjuncts.join(' ')})`
  return parseExpressionExpectingAtom(
    or_expression,
    'or',
  )
}
