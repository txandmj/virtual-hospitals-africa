import { RuleRunnerInput, TrxOrDb } from '../../types.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { system_priority_evaluation } from '../../shared/s_expression_schemas.ts'
import { SYSTEM_PRIORITY_EVALUATIONS_LISP } from '../../s_expression/system_priority_evaluations.ts'
import { patient_triage } from './patient_triage.ts'
import { ORDERED_PRIORITIES, Priority } from '../../shared/priorities.ts'
import { pMap } from '../../util/inParallel.ts'
import { nonGroupedBaseQuery } from './patient_records_base.ts'
import { rules } from './rules.ts'
import isString from '../../util/isString.ts'
import { assert } from 'std/assert/assert.ts'
import uniq from '../../util/uniq.ts'
import { priorityQuery } from './patient_records.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'

export const SYSTEM_PRIORITY_EVALUATIONS_PARSED = SYSTEM_PRIORITY_EVALUATIONS_LISP.map((d) => parseWithSchema(d, system_priority_evaluation))

export const system_priority_evaluations = {
  async insertSystemPriorityEvaluationsIfNotAlreadyIdentified(
    trx: TrxOrDb,
    input: RuleRunnerInput,
  ) {
    const rules_result = await rules.getApplicableBasedOnNewRecords(trx, input, 'system_priority_evaluation')

    if (isString(rules_result)) return rules_result

    if (!rules_result.length) return 'None to insert'

    for (const x of rules_result) {
      if (!x.matching_finding_ids.length) {
        throw new Error('klklk' + humanReadableJson(x))
      }
    }

    const all_finding_ids = uniq(rules_result.flatMap((rule_result) => rule_result.matching_finding_ids))
    console.log({ all_finding_ids, rules_result })
    const findings: {
      id: string
      priority: Priority | null
    }[] = await nonGroupedBaseQuery(trx)
      .clearSelect()
      .where('patient_records_aggregated.id', 'in', all_finding_ids)
      .select((eb) => [
        'patient_records_aggregated.id',
        priorityQuery(eb),
      ])
      .execute()

    const findings_by_id = new Map(findings.map((f) => [f.id, f]))

    const rules_needing_insert = rules_result.filter(({ rule_effect, matching_finding_ids }) => {
      assert(rule_effect.type === 'system_priority_evaluation')
      return matching_finding_ids.some((id) => {
        const { priority } = findings_by_id.get(id) ?? { priority: null }
        return !priority || ORDERED_PRIORITIES.indexOf(priority) > ORDERED_PRIORITIES.indexOf(rule_effect.priority)
      })
    })

    if (!rules_needing_insert.length) {
      return `system_priority_evaluation rule matched, but all records already have that priority level or higher`
    }

    console.time(`${input.listener_name} ${input.listener_id} insert_levels`)
    const inserted = await pMap(
      rules_needing_insert,
      ({ id, rule_effect, matching_finding_ids }) => {
        assert(rule_effect.type === 'system_priority_evaluation')
        return patient_triage.insertLevel(trx, {
          patient_id: input.patient_id,
          patient_encounter_id: input.patient_encounter_id,
          by_system: true,
          triage_level: rule_effect.priority,
          evaluates_record_ids: matching_finding_ids,
          system_priority_evaluation_id: id,
        })
      },
    )
    console.timeEnd(`${input.listener_name} ${input.listener_id} insert_levels`)

    return `Inserted ${inserted.length} priority evaluation(s)`
  },
}
