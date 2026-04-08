import { SYSTEM_DIAGNOSIS_RULES_LISP } from '../s_expression/system_diagnosis_rules.ts'
import { parseWithSchema } from './s_expression.ts'
import { system_diagnosis_rule } from './s_expression_schemas.ts'

export const SYSTEM_DIAGNOSIS_RULES_PARSED = SYSTEM_DIAGNOSIS_RULES_LISP.map((d) => parseWithSchema(d, system_diagnosis_rule))
