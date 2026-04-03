import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { literalString } from '../helpers.ts'
import { patient_records, PatientRecordsSearch } from './patient_records.ts'
import { base } from './_base.ts'
import { formatRecord } from '../../shared/patient_records.ts'

export const patient_records_any_top_level = base({
  top_level_table: 'patient_records_aggregated',
  baseQuery(
    trx: TrxOrDbOrQueryCreator,
    opts: PatientRecordsSearch,
  ) {
    return patient_records.baseQuery(trx, opts)
      .leftJoin(
        'patient_findings',
        'patient_findings.id',
        'patient_records_aggregated.id',
      )
      .select([
        literalString('finding').$castTo<'finding'>().as('type'),
        'patient_findings.patient_encounter_employee_id',
      ])
  },
  formatResult: formatRecord,
})
