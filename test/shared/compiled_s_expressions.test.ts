import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { TASKS_LISP } from '../../s_expression/tasks.ts'
import { Lang, QueryableEvidenceNode, SnomedConcept, system_diagnosis_rule, system_priority_evaluation, task } from '../../shared/s_expression_schemas.ts'
import db from '../../db/db.ts'
import { collect, filter } from '../../util/inParallel.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'
import { SYSTEM_PRIORITY_EVALUATIONS_LISP } from '../../s_expression/system_priority_evaluations.ts'
import { SYSTEM_DIAGNOSIS_RULES_LISP } from '../../s_expression/system_diagnosis_rules.ts'
import { parseLispFile, walkDirectory } from '../../s_expression/compile.ts'
import { allEvidenceToLookFor } from '../../db/models/s_expression_evidence.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { ALL_ASESSMENT_OPTIONS_PARSED, VITALS_ADULT_SNOMED_CONCEPT_NAMES } from '../../shared/vitals.ts'
import { assertUnreachable } from '../../util/assertUnreachable.ts'
import { isCheckFor } from '../../db/models/additional_tasks.ts'
import compactMap from '../../util/compactMap.ts'

export function* allConceptsToLookFor(
  node: QueryableEvidenceNode | Lang['task' | 'system_diagnosis_rule' | 'system_priority_evaluation'],
): Generator<SnomedConcept> {
  switch (node.atom) {
    case 'qualifier':
      if (node.specific_snomed_concept) yield node.specific_snomed_concept
      for (const qualifier of node.qualifiers) {
        yield* allConceptsToLookFor(qualifier)
      }
      break
    case 'attribute':
      if (node.specific_snomed_concept) yield node.specific_snomed_concept
      break
    case 'active_condition':
      yield node.snomed_concept
      break
    case 'finding':
    case 'evaluation':
      if (node.root_snomed_concept) yield node.root_snomed_concept
      if (node.specific_snomed_concept) yield node.specific_snomed_concept
      if (node.value_snomed_concept) yield node.value_snomed_concept
      for (const qualifier of node.qualifiers) {
        yield* allConceptsToLookFor(qualifier)
      }
      for (const attribute of node.attributes) {
        yield* allConceptsToLookFor(attribute)
      }
      if ('excluding' in node) {
        for (const excluding of node.excluding) {
          yield* allConceptsToLookFor(excluding.finding)
        }
      }
      break
    case 'procedure':
      if (node.root_snomed_concept) yield node.root_snomed_concept
      if (node.specific_snomed_concept) yield node.specific_snomed_concept
      if (Array.isArray(node.value)) {
        for (const n of node.value) {
          yield* allConceptsToLookFor(n)
        }
      }
      for (const qualifier of node.qualifiers) {
        yield* allConceptsToLookFor(qualifier)
      }
      break

    case 'diagnosis':
    case 'measurement':
      yield node.snomed_concept
      break
    case '<':
    case '<=':
    case '=':
    case '>':
    case '>=':
      if (node.type === 'measurement') yield* allConceptsToLookFor(node.measurement)
      break
    case 'or':
    case 'and':
    case 'any2':
      for (const expression of node.expressions) {
        yield* allConceptsToLookFor(expression)
      }
      break
    case 'not':
      yield* allConceptsToLookFor(node.expression)
      break
    case 'task':
      yield* allConceptsToLookFor(node.due_to)
      yield* allConceptsToLookFor(node.to_be_done)
      break
    case 'system_diagnosis_rule':
      yield* allConceptsToLookFor(node.due_to)
      yield* allConceptsToLookFor(node.diagnosis)
      break
    case 'system_priority_evaluation':
      yield* allConceptsToLookFor(node.due_to)
      break
    default:
      assertUnreachable(node)
  }
}

export async function conceptDoesNotExist({ concept }: { concept: SnomedConcept }): Promise<boolean> {
  const found = await db.selectFrom('snomed_inferred_canonical_name_and_category')
    .where('name', '=', concept.name)
    .where('category', '=', concept.category)
    .limit(1)
    .executeTakeFirst()

  return !found
}

function* nodesAndConceptsTasks() {
  for (const s_expression of TASKS_LISP) {
    const node = parseWithSchema(s_expression, task)
    for (const concept of allConceptsToLookFor(node)) {
      yield { concept, node }
    }
  }
}

function* nodesAndConceptsSystemPriorityEvaluations() {
  for (const s_expression of SYSTEM_PRIORITY_EVALUATIONS_LISP) {
    const node = parseWithSchema(s_expression, system_priority_evaluation)
    for (const concept of allConceptsToLookFor(node)) {
      yield { concept, node }
    }
  }
}

function* nodesAndConceptsSystemDiagnosisRules() {
  for (const s_expression of SYSTEM_DIAGNOSIS_RULES_LISP) {
    const node = parseWithSchema(s_expression, system_diagnosis_rule)
    for (const concept of allConceptsToLookFor(node)) {
      yield { concept, node }
    }
  }
}

describe('s_expression', () => {
  afterAll(() => db.destroy())
  describe('TASKS_LISP', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsTasks(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })
  })
  describe('SYSTEM_PRIORITY_EVALUATIONS_LISP', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsSystemPriorityEvaluations(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })

    it('leverages findings we check for in TASKS_LISP or things that we can diagnose as probable based on the apc adult guidelines', async () => {
      const system_diagnosis_rules = SYSTEM_DIAGNOSIS_RULES_LISP.map((s_expression) => parseWithSchema(s_expression, system_diagnosis_rule))

      const all_probable_diagnoses = compactMap(system_diagnosis_rules, (system_diagnosis_rule) => {
        if (system_diagnosis_rule.diagnosis.certainty_qualifier !== 'probable') return
        return system_diagnosis_rule.diagnosis.snomed_concept
      })

      const rules_without_corresponding_check_foror_system_diagnosis_rule = await collect(systemPriorityEvaluationsWithNoCheckForNorDiagnosis())
      assertArrayEmpty(rules_without_corresponding_check_foror_system_diagnosis_rule)

      async function* systemPriorityEvaluationsWithNoCheckForNorDiagnosis() {
        for await (const { file_path, system_priority_evaluations, tasks } of correspondingAPCRules()) {
          const all_checking_for = new Set(tasks.flatMap((task_node) => {
            const due_to = allEvidenceToLookFor(task_node.due_to).map(inverseSExpression)
            // TODO  || isMeasurements(task_node.to_be_done)?
            const checking_for = isCheckFor(task_node.to_be_done) ? task_node.to_be_done.value.map(inverseSExpression) : []

            return [
              ...due_to,
              ...checking_for,
            ]
          }))

          for (const rule of system_priority_evaluations) {
            for (const evidence of allEvidenceToLookFor(rule.due_to)) {
              const finding = (
                  evidence.atom === '>' ||
                  evidence.atom === '<' ||
                  evidence.atom === '>=' ||
                  evidence.atom === '<=' ||
                  evidence.atom === '='
                )
                ? evidence.measurement
                : evidence

              const evidence_collected_during_vitals = (
                finding.atom === 'measurement' && VITALS_ADULT_SNOMED_CONCEPT_NAMES.has(finding.snomed_concept.name)
              ) || (
                finding.atom === 'active_condition' && finding.snomed_concept.name === 'Fever'
              ) || (
                finding.atom === 'finding' &&
                ALL_ASESSMENT_OPTIONS_PARSED.some((option) =>
                  option.specific_snomed_concept!.name === finding.specific_snomed_concept?.name &&
                  option.specific_snomed_concept!.category === finding.specific_snomed_concept?.category
                )
              )
              if (evidence_collected_during_vitals) continue
              const evaluating_a_diagnosed_condition = finding.atom === 'active_condition' &&
                all_probable_diagnoses.some((probable_diagnosis) =>
                  finding.snomed_concept.name === probable_diagnosis.name &&
                  finding.snomed_concept.category === probable_diagnosis.category
                )
              if (evaluating_a_diagnosed_condition) continue
              const finding_s_expression = inverseSExpression(finding)
              if (all_checking_for.has(finding_s_expression)) continue

              yield {
                file_path,
                description: rule.description,
                didnt_check_for: finding_s_expression,
              }
            }
          }
        }
      }

      async function* correspondingAPCRules() {
        for await (const file_path of walkDirectory('s_expression/rules/apc-adult')) {
          const rules = await parseLispFile(file_path)
          yield {
            file_path,
            tasks: rules.filter((rule) => rule.atom === 'task'),
            system_priority_evaluations: rules.filter((rule) => rule.atom === 'system_priority_evaluation'),
          }
        }
      }
    })
  })
  describe('SYSTEM_DIAGNOSIS_RULES_LISP', () => {
    it('has valid snomed concepts', async () => {
      const not_found = await filter(nodesAndConceptsSystemDiagnosisRules(), conceptDoesNotExist)
      assertArrayEmpty(not_found)
    })

    it('leverages findings we check for in TASKS_LISP based on the apc adult guidelines', async () => {
      const rules_without_corresponding_check_for = await collect(probableSystemDiagnosisRulesWithNoCheckFor())
      assertArrayEmpty(rules_without_corresponding_check_for)

      async function* probableSystemDiagnosisRulesWithNoCheckFor() {
        for await (const { file_path, system_diagnosis_rules, tasks } of correspondingAPCRules()) {
          const all_checking_for = new Set(tasks.flatMap((task_node) => {
            const due_to = allEvidenceToLookFor(task_node.due_to).map(inverseSExpression)
            // TODO  || isMeasurements(task_node.to_be_done)?
            const checking_for = isCheckFor(task_node.to_be_done) ? task_node.to_be_done.value.map(inverseSExpression) : []

            return [
              ...due_to,
              ...checking_for,
            ]
          }))

          for (const rule of system_diagnosis_rules) {
            if (rule.diagnosis.certainty_qualifier !== 'probable') continue
            for (const evidence of allEvidenceToLookFor(rule.due_to)) {
              const finding = (
                  evidence.atom === '>' ||
                  evidence.atom === '<' ||
                  evidence.atom === '>=' ||
                  evidence.atom === '<=' ||
                  evidence.atom === '='
                )
                ? evidence.measurement
                : evidence

              const evidence_collected_during_vitals = (
                finding.atom === 'measurement' && VITALS_ADULT_SNOMED_CONCEPT_NAMES.has(finding.snomed_concept.name)
              ) || (
                finding.atom === 'active_condition' && finding.snomed_concept.name === 'Fever'
              )
              if (evidence_collected_during_vitals) continue
              const finding_s_expression = inverseSExpression(finding)
              if (!all_checking_for.has(finding_s_expression)) {
                yield {
                  file_path,
                  description: rule.description,
                  didnt_check_for: finding_s_expression,
                }
              }
            }
          }
        }
      }

      async function* correspondingAPCRules() {
        for await (const file_path of walkDirectory('s_expression/rules/apc-adult')) {
          const rules = await parseLispFile(file_path)
          yield {
            file_path,
            tasks: rules.filter((rule) => rule.atom === 'task'),
            system_diagnosis_rules: rules.filter((rule) => rule.atom === 'system_diagnosis_rule'),
          }
        }
      }
    })
  })
  describe('apc-adult', () => {
    it('has maximum one file per page number', async () => {
      const filepaths = await collect(walkDirectory('s_expression/rules/apc-adult'))
      assertUniquePageNumbers(filepaths)

      function assertUniquePageNumbers(filepaths: string[]) {
        const page_numbers = new Set<string>()
        for (const filepath of filepaths) {
          const page_number = filepath.match(/(\d+)/)![1]
          if (page_numbers.has(page_number)) {
            throw new Error(page_number + ' xx ' + filepath)
          }
          page_numbers.add(page_number)
        }
      }
    })
  })
})
