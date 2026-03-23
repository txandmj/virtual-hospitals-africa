import z from 'zod'
import { sExpressionZodValidator } from '../../shared/s_expression.ts'
import { insertable_finding_base } from '../../shared/s_expression_schemas.ts'
import { yes_no_unknown } from '../../util/validators.ts'
import { NO_QUALIFIER, UNKNOWN_QUALIFIER } from '../../shared/snomed_concepts.ts'
import compactMap from '../../util/compactMap.ts'
import { FindingNodeToInsert } from './patient_findings.ts'
import type { RenderedTaskToBeDone } from '../../types.ts'

export const CheckForSchema = z.object({
  s_expression: sExpressionZodValidator(insertable_finding_base),
  existence: yes_no_unknown,
  existing_record: z.object({
    id: z.string().uuid(),
    existence: yes_no_unknown,
  }).nullish(),
})

export const check_for = {
  Schema: CheckForSchema,
  asInsertableFindings(check_for: z.infer<typeof CheckForSchema>[]): FindingNodeToInsert[] {
    return compactMap(check_for, (finding) => {
      if (finding.existing_record && finding.existing_record.existence === finding.existence) return
      return {
        ...finding.s_expression,
        existence: finding.existence,
        value_snomed_concept: finding.existence === 'Yes' ? null : finding.existence === 'No'
          ? {
            atom: 'snomed_concept',
            ...NO_QUALIFIER,
          }
          : {
            atom: 'snomed_concept',
            ...UNKNOWN_QUALIFIER,
          },
      }
    })
  },

  isCheckFor(task_to_be_done: RenderedTaskToBeDone): task_to_be_done is RenderedTaskToBeDone & { atom: 'finding' } {
    return task_to_be_done.atom === 'finding'
  },
}
