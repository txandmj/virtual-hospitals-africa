import { SYSTEM_PRIORITY_EVALUATIONS_LISP } from '../s_expression/system_priority_evaluations.ts'
import { parseWithSchema } from './s_expression.ts'
import { system_priority_evaluation } from './s_expression_schemas.ts'

export const SYSTEM_PRIORITY_EVALUATIONS_PARSED = SYSTEM_PRIORITY_EVALUATIONS_LISP.map((d) => parseWithSchema(d, system_priority_evaluation))
