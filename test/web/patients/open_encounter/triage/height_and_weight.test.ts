import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { getFormValues } from '../../../../_helpers/form.ts'
import { asWarningSignsAdult, dateOfBirth, heightOf, setupTriageNewPatient, setupTriageReturningPatient, weightOf } from './_setup.ts'
import { patient_encounters } from '../../../../../db/models/patient_encounters.ts'
import { events } from '../../../../../db/models/events.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS, VITALS_COMPUTED_SNOMED_CONCEPTS } from '../../../../../shared/vitals.ts'

describeParallel('triage/height_and_weight', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('POST', () => {
    itParallel(
      'computes and inserts BMI alongside height/weight when both are submitted',
      async () => {
        const { patient_id } = await setupTriageNewPatient({
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

        const bmi_record = await db.selectFrom('patient_records_aggregated as pra')
          .innerJoin('patient_measurements as pm', 'pm.id', 'pra.id')
          .where('pra.patient_id', '=', patient_id)
          .where(
            'pra.specific_snomed_concept_id',
            '=',
            VITALS_COMPUTED_SNOMED_CONCEPTS.body_mass_index.id,
          )
          .select(['pm.value', 'pm.units'])
          .executeTakeFirstOrThrow()

        // 70 kg / (1.6 m)^2 = 27.34375 → rounded to 1 decimal place
        assertEquals(bmi_record.units, 'kg/m²')
        assertEquals(String(bmi_record.value), '27.3')
      },
    )
  })

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
      'prefills height/weight values when adult patient has measurements within the last year',
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

        const { $ } = await setupTriageReturningPatient({
          nurse,
          clinic,
          shcp,
          patient_id,
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
            height: { value: String(heightOf('adult')), units: 'cm' },
            weight: { value: String(weightOf('adult')), units: 'kg' },
          },
        })
      },
    )

    itParallel(
      'does not pre-fill the step when adult patient has measurements over a year old',
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

        const { $ } = await setupTriageReturningPatient({
          nurse,
          clinic,
          shcp,
          patient_id,
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
  })
})
