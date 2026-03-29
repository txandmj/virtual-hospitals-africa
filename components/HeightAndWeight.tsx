import { RenderedFindingRelativeToHealthWorker } from '../types.ts'
import { VitalsMeasurementsForm } from './vitals/MeasurementsForm.tsx'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS } from '../shared/vitals.ts'

export function HeightAndWeight({
  most_recent_patient_vitals,
  organization_id,
}: {
  most_recent_patient_vitals: RenderedFindingRelativeToHealthWorker[]
  organization_id: string
}) {
  const one_year_ago = new Date()
  one_year_ago.setFullYear(one_year_ago.getFullYear() - 1)

  function recentValue(snomed_concept_id: string): string | undefined {
    const vital = most_recent_patient_vitals.find(
      (v) => v.specific_snomed_concept_id === snomed_concept_id,
    )
    if (!vital || new Date(vital.created_at) < one_year_ago) return undefined
    return vital.value?.type === 'measurement' ? vital.value.value : undefined
  }

  return (
    <VitalsMeasurementsForm
      id='height-and-weight'
      vital_measurements_for_this_encounter={[
        {
          vital: 'height',
          snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id,
          required: true,
          units: 'cm',
          value: recentValue(VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id),
        },
        {
          vital: 'weight',
          snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id,
          required: true,
          units: 'kg',
          value: recentValue(VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id),
        },
      ]}
      triage_assessments={[]}
      most_recent_patient_vitals={most_recent_patient_vitals}
      organization_id={organization_id}
    />
  )
}
