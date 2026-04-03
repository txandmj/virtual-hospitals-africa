import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { PatientRecordsSearch } from './patient_records.ts'
import { base, IntermediateResult, SearchResult } from './_base.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { patient_findings } from './patient_findings.ts'
import { patient_procedures } from './patient_procedures.ts'
import { SelectQueryBuilder } from 'kysely'
import { DB, PatientRecordsAggregated } from '../../db.d.ts'
import { assertUnreachable } from '../../util/assertUnreachable.ts'

type IntermediateRecord =
  | IntermediateResult<typeof patient_findings>
  | IntermediateResult<typeof patient_evaluations>
  | IntermediateResult<typeof patient_procedures>

// deno-lint-ignore no-explicit-any
type SelectIntermediate = SelectQueryBuilder<DB & { procedures_aggregated: PatientRecordsAggregated }, any, IntermediateRecord>

export const patient_records_any_top_level = base({
  top_level_table: 'patient_records_aggregated',
  baseQuery(
    trx: TrxOrDbOrQueryCreator,
    opts: PatientRecordsSearch,
  ) {
    const findings: SelectIntermediate = patient_findings.baseQuery(trx, opts)
    const evaluations: SelectIntermediate = patient_evaluations.baseQuery(trx, opts)
    const procedures: SelectIntermediate = patient_procedures.baseQuery(trx, opts)
    return findings.unionAll(evaluations).unionAll(procedures)
  },
  formatResult(record): SearchResult<typeof patient_findings> | SearchResult<typeof patient_evaluations> | SearchResult<typeof patient_procedures> {
    // Typescript needs a little love.
    switch (record.type) {
      case 'finding': return formatRecord(record)
      case 'evaluation': return formatRecord(record)
      case 'procedure': return formatRecord(record)
      default: assertUnreachable(record)
    }
  },
})
