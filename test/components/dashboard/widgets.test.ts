import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { patientsInCareWidget } from '../../../components/dashboard/widgets/PatientsInCare.tsx'

type EmploymentLike = Parameters<typeof patientsInCareWidget.canSee>[0]

function employment(overrides: Partial<EmploymentLike> = {}): EmploymentLike {
  // Cast through unknown — we only exercise fields canSee actually reads.
  return {
    role: 'nurse',
    is_admin: false,
    ...overrides,
  } as unknown as EmploymentLike
}

describe('dashboard widgets: canSee', () => {
  describe('patientsInCareWidget', () => {
    it('is visible to any employee', () => {
      assertEquals(patientsInCareWidget.canSee(employment({ role: 'nurse' })), true)
      assertEquals(patientsInCareWidget.canSee(employment({ role: 'doctor' })), true)
      assertEquals(patientsInCareWidget.canSee(employment({ role: 'admin', is_admin: true })), true)
    })

    it('has a stable id', () => {
      assertEquals(patientsInCareWidget.id, 'patients_in_care')
    })
  })

  describe('encountersInRangeWidget', () => {
    it('is visible to any employee', async () => {
      const { encountersInRangeWidget } = await import(
        '../../../components/dashboard/widgets/EncountersInRange.tsx'
      )
      assertEquals(encountersInRangeWidget.canSee(employment({ role: 'nurse' })), true)
      assertEquals(encountersInRangeWidget.canSee(employment({ role: 'doctor' })), true)
      assertEquals(encountersInRangeWidget.id, 'encounters_in_range')
    })
  })

  describe('staffOnShiftWidget', () => {
    it('is visible to any employee', async () => {
      const { staffOnShiftWidget } = await import(
        '../../../components/dashboard/widgets/StaffOnShift.tsx'
      )
      assertEquals(staffOnShiftWidget.canSee(employment({ role: 'nurse' })), true)
      assertEquals(staffOnShiftWidget.canSee(employment({ role: 'admin', is_admin: true })), true)
      assertEquals(staffOnShiftWidget.id, 'staff_on_shift')
    })
  })
})
