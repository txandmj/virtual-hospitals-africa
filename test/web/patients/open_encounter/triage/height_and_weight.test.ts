import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { getFormValues } from '../../../../_helpers/form.ts'
import { asWarningSignsAdult, dateOfBirth, heightOf, setupTriageNewPatient, setupTriageReturningPatient, weightOf } from './_setup.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'
import { assert } from 'std/assert/assert.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS } from '../../../../../shared/vitals.ts'
import { events } from '../../../../../db/models/events.ts'

describeParallel('triage/height_and_weight', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('GET', () => {
    itParallel(
      'prompts for height and weight for first-time patients with no prior measurements',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: dateOfBirth('adult') },
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
          brief_history: {
            common_conditions: {
              diabetes: { existence: 'No' },
              pregnancy: { existence: 'No' },
            },
          },
        })

        assertEquals(getFormValues($), {
          measurements: {
            height: { value: null, units: 'cm' },
            weight: { value: null, units: 'kg' },
          },
        })
      },
    )

    itParallel(
      'completes the step on encounter start when adult patient has measurements within the last year',
      async () => {
        const { nurse, clinic, shcp, patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: dateOfBirth('adult') },
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
          brief_history: {
            common_conditions: {
              diabetes: { existence: 'No' },
              pregnancy: { existence: 'No' },
            },
          },
          height_and_weight: {
            measurements: {
              height: { value: heightOf('adult'), units: 'cm' },
              weight: { value: weightOf('adult'), units: 'kg' },
            },
          },
        })

        await patient_encounters.close(db, { patient_encounter_id })

        const second = await setupTriageReturningPatient({ nurse, clinic, shcp, patient_id })

        const encounter = await patient_encounters.getById(db, second.patient_encounter_id)
        const steps_completed: string[] = encounter.workflows.triage!.steps_completed
        assert(
          steps_completed.includes('height_and_weight'),
          `Expected height_and_weight to be pre-completed, got: ${JSON.stringify(steps_completed)}`,
        )
      },
    )

    itParallel(
      'does not complete the step when adult patient has measurements over a year old',
      async () => {
        const { nurse, clinic, shcp, patient_id, patient_encounter_id } = await setupTriageNewPatient({
          patient_demographics: { date_of_birth: dateOfBirth('adult') },
          warning_signs: asWarningSignsAdult([], { pregnant: false }),
          brief_history: {
            common_conditions: {
              diabetes: { existence: 'No' },
              pregnancy: { existence: 'No' },
            },
          },
          height_and_weight: {
            measurements: {
              height: { value: heightOf('adult'), units: 'cm' },
              weight: { value: weightOf('adult'), units: 'kg' },
            },
          },
        })

        // Backdate the height/weight records to over a year ago
        const over_a_year_ago = new Date()
        over_a_year_ago.setFullYear(over_a_year_ago.getFullYear() - 1)
        over_a_year_ago.setDate(over_a_year_ago.getDate() - 1)

        await db.updateTable('patient_records_aggregated')
          .set({ created_at: over_a_year_ago })
          .where('patient_id', '=', patient_id)
          .where('specific_snomed_concept_id', 'in', [
            VITAL_MEASUREMENTS_SNOMED_CONCEPTS.height.id,
            VITAL_MEASUREMENTS_SNOMED_CONCEPTS.weight.id,
          ])
          .execute()

        await patient_encounters.close(db, { patient_encounter_id })

        const second = await setupTriageReturningPatient({ nurse, clinic, shcp, patient_id })

        const encounter = await patient_encounters.getById(db, second.patient_encounter_id)
        const steps_completed: string[] = encounter.workflows.triage!.steps_completed
        assert(steps_completed)
        assert(
          !steps_completed.includes('height_and_weight'),
          `Expected height_and_weight to NOT be pre-completed, got: ${JSON.stringify(steps_completed)}`,
        )
      },
    )
  })
})
