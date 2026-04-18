import { assert } from 'std/assert/assert.ts'
import parse from 's-expression'
import { walk } from 'std/fs/mod.ts'
import { parseWithSchema } from '../shared/s_expression.ts'
import { inverseSExpression } from '../shared/s_expression_inverse.ts'
import { any_rule, Lang } from '../shared/s_expression_schemas.ts'
import { groupBy } from '../util/groupBy.ts'

/**
 * Strip Lisp-style comments (lines starting with ;;) from the input text
 */
function stripComments(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const comment_index = line.indexOf(';;')
      return comment_index >= 0 ? line.substring(0, comment_index) : line
    })
    .join('\n')
}

/**
 * Extract top-level s-expressions from text
 * Returns an array of s-expression strings
 */
function extractSExpressions(text: string) {
  const parsed = parse(`(${stripComments(text)})`)
  if (parsed instanceof Error) {
    throw parsed
  }
  assert(Array.isArray(parsed))
  return parsed.map((expr) => parseWithSchema(expr, any_rule))
}

function tsContent(const_name: string, expressions: string[]) {
  return `// Auto-generated
// Do not edit manually

export const ${const_name} = [
  ${expressions.map((expr) => `\`${expr}\`,`).join('\n  ')}
]
`
}

export async function parseLispFile(lisp_path: string) {
  const content = await Deno.readTextFile(lisp_path)
  return extractSExpressions(content)
}

const RULES_DIR = 's_expression/rules'

export async function* walkDirectory(dir = RULES_DIR) {
  for await (const entry of walk(dir, { exts: ['.lisp'] })) {
    assert(entry.isFile)
    yield entry.path
  }
}

/**
 * Main function - process all .lisp files in s_expression directory
 */
async function main() {
  const all_rules: Lang['task' | 'system_diagnosis_rule' | 'system_priority_evaluation'][] = []
  for await (const lisp_file of walkDirectory()) {
    const rules = await parseLispFile(lisp_file)
    for (const rule of rules) {
      all_rules.push(rule)
    }
  }
  const grouped_rules = groupBy(all_rules, 'atom')

  await Deno.writeTextFile('s_expression/tasks.ts', tsContent('TASKS_LISP', grouped_rules.get('task')!.map(inverseSExpression)))
  await Deno.writeTextFile(
    's_expression/system_diagnosis_rules.ts',
    tsContent('SYSTEM_DIAGNOSIS_RULES_LISP', grouped_rules.get('system_diagnosis_rule')!.map(inverseSExpression)),
  )
  await Deno.writeTextFile(
    's_expression/system_priority_evaluations.ts',
    tsContent('SYSTEM_PRIORITY_EVALUATIONS_LISP', grouped_rules.get('system_priority_evaluation')!.map(inverseSExpression)),
  )

  console.log('\n✓ All files processed successfully')
}

if (import.meta.main) {
  main()
}
