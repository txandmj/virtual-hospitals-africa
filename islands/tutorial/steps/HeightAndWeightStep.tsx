// =============================================================================
// FILE: /islands/tutorial/steps/HeightAndWeightStep.tsx
// Height and weight step wrapper for tutorial - uses real component with mock data
// =============================================================================

import { HeightAndWeight } from '../../../components/HeightAndWeight.tsx'
import { TUTORIAL_HEIGHT_WEIGHT } from '../../../shared/tutorial/mock-data.ts'

export function HeightAndWeightStep() {
  return (
    <div data-tutorial='height-and-weight-section'>
      <HeightAndWeight
        most_recent_patient_vitals={TUTORIAL_HEIGHT_WEIGHT}
        organization_id='tutorial-org'
      />
    </div>
  )
}
