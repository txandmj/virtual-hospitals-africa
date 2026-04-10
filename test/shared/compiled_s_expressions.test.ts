import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { TASKS_LISP } from '../../s_expression/tasks.ts'
import { QueryableEvidenceNode, SnomedConcept, system_diagnosis_rule, system_priority_evaluation, task } from '../../shared/s_expression_schemas.ts'
import db from '../../db/db.ts'
import { collect, filter } from '../../util/inParallel.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'
import { SYSTEM_PRIORITY_EVALUATIONS_LISP } from '../../s_expression/system_priority_evaluations.ts'
import { SYSTEM_DIAGNOSIS_RULES_LISP } from '../../s_expression/system_diagnosis_rules.ts'
import { parseLispFile, walkDirectory } from '../../s_expression/compile.ts'
import { exists } from '../../util/exists.ts'
import { assert } from 'std/assert/assert.ts'
import { allEvidenceToLookFor } from '../../db/models/s_expression_evidence.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { VITALS_ADULT_SNOMED_CONCEPT_NAMES } from '../../shared/vitals.ts'
import { assertUnreachable } from '../../util/assertUnreachable.ts'
import { isCheckFor } from '../../db/models/additional_tasks.ts'

export function* allConceptsToLookFor(node: QueryableEvidenceNode): Generator<SnomedConcept> {
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
    default:
      assertUnreachable(node)
  }
}

async function conceptDoesNotExist({ concept }: { concept: SnomedConcept }): Promise<boolean> {
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
    for (const concept of allConceptsToLookFor(node.due_to)) {
      yield { concept, node }
    }
  }
}

function* nodesAndConceptsSystemPriorityEvaluations() {
  for (const s_expression of SYSTEM_PRIORITY_EVALUATIONS_LISP) {
    const node = parseWithSchema(s_expression, system_priority_evaluation)
    for (const concept of allConceptsToLookFor(node.due_to)) {
      yield { concept, node }
    }
  }
}

function* nodesAndConceptsSystemDiagnosisRules() {
  for (const s_expression of SYSTEM_DIAGNOSIS_RULES_LISP) {
    const node = parseWithSchema(s_expression, system_diagnosis_rule)
    for (const concept of allConceptsToLookFor(node.due_to)) {
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
        for await (const { task_file_path, system_diagnosis_rules_file_path, system_diagnosis_rules, tasks } of correspondingAPCRules()) {
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
                  task_file_path,
                  system_diagnosis_rules_file_path,
                  description: rule.description,
                  didnt_check_for: finding_s_expression,
                }
              }
            }
          }
        }
      }

      async function* correspondingAPCRules() {
        const s_expression_directory = await walkDirectory()
        const system_diagnosis_rules_file_paths = exists(s_expression_directory.get('system_diagnosis_rules'))
        const tasks_file_paths = exists(s_expression_directory.get('tasks'))
        const apc_system_diagnosis_rules_file_paths = system_diagnosis_rules_file_paths.filter((path) => path.includes('apc-adult'))

        for (const system_diagnosis_rules_file_path of apc_system_diagnosis_rules_file_paths) {
          const task_file_path = system_diagnosis_rules_file_path.replace('/system_diagnosis_rules/', '/tasks/')
          assert(tasks_file_paths.includes(task_file_path), `${task_file_path} missing`)

          const system_diagnosis_rules = await parseLispFile(system_diagnosis_rules_file_path).then((expressions) =>
            expressions.map((expression) => parseWithSchema(expression, system_diagnosis_rule))
          )
          const tasks = await parseLispFile(task_file_path).then((expressions) => expressions.map((expression) => parseWithSchema(expression, task)))

          yield {
            task_file_path,
            system_diagnosis_rules_file_path,
            system_diagnosis_rules,
            tasks,
          }
        }
      }
    })
  })
  describe('apc-adult', () => {
    it('has maximum one file per page number', async () => {
      const s_expression_directory = await walkDirectory()
      const system_diagnosis_rules_file_paths = exists(s_expression_directory.get('system_diagnosis_rules')).filter((path) => path.includes('apc-adult'))
      const system_priority_evaluations_file_paths = exists(s_expression_directory.get('system_priority_evaluations')).filter((path) =>
        path.includes('apc-adult')
      )
      const tasks_file_paths = exists(s_expression_directory.get('tasks')).filter((path) => path.includes('apc-adult'))

      assertUniquePageNumbers(system_diagnosis_rules_file_paths)
      assertUniquePageNumbers(system_priority_evaluations_file_paths)
      assertUniquePageNumbers(tasks_file_paths)

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
