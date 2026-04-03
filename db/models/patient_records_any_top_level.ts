import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { PatientRecordsSearch } from './patient_records.ts'
import { base, IntermediateResult, SearchResult } from './_base.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { patient_findings } from './patient_findings.ts'
import { patient_procedures } from './patient_procedures.ts'
import { SelectQueryBuilder, sql } from 'kysely'
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
    
    const findings = trx.selectFrom(
      patient_findings.baseQuery(trx, opts).as('r')
    ).select([
      'r.id',
      sql<IntermediateRecord>`row_to_json(r)`.as('record'),
    ])

    const evaluations = trx.selectFrom(
      patient_evaluations.baseQuery(trx, opts).as('r')
    ).select([
      'r.id',
      sql<IntermediateRecord>`row_to_json(r)`.as('record'),
    ])

    const procedures = trx.selectFrom(
      patient_procedures.baseQuery(trx, opts).as('r')
    ).select([
      'r.id',
      sql<IntermediateRecord>`row_to_json(r)`.as('record'),
    ])

    console.log('trying findings...')
    return findings
    // console.log('trying evaluations...')
    // // return evaluations
    // console.log('trying procedures...')
    // // return procedures
    // return findings.unionAll(evaluations).unionAll(procedures)
  },
  formatResult({ record }): SearchResult<typeof patient_findings> | SearchResult<typeof patient_evaluations> | SearchResult<typeof patient_procedures> {
    switch (record.type) {
      case 'finding': return formatRecord(record)
      case 'evaluation': return formatRecord(record)
      case 'procedure': return formatRecord(record)
      default: assertUnreachable(record)
    }
  },
})
