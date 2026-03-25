import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'

export const patient_triage_associated_findings = base({
  top_level_table: 'patient_records_aggregated',
  baseQuery(trx: TrxOrDbOrQueryCreator) {
    return trx.selectFrom('patient_records_aggregated') // associated findings
      .innerJoin('patient_records_still_valid as associated_findings_still_valid', 'associated_findings_still_valid.id', 'patient_records_aggregated.id')
      .innerJoin('patient_record_relations as triage_relations', 'triage_relations.destination_id', 'patient_records_aggregated.id')
      .innerJoin(
        'patient_triage_level',
        'triage_relations.source_id',
        'patient_triage_level.id',
      )
      .innerJoin(
        'patient_records as triage_patient_records',
        'patient_triage_level.id',
        'triage_patient_records.id',
      )
      .innerJoin('patient_records_still_valid as triage_valid', 'triage_valid.id', 'triage_patient_records.id')
      .select('patient_records_aggregated.id')
  },
  formatResult: identity,
})
