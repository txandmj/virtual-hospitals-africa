import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { patients_in_care_widget } from '../../../backend/dashboard/widgets/PatientsInCare.tsx'
import { encounters_in_range_widget } from '../../../backend/dashboard/widgets/EncountersInRange.tsx'
import { staff_on_shift_widget } from '../../../backend/dashboard/widgets/StaffOnShift.tsx'

type EmploymentLike = Parameters<typeof patients_in_care_widget.canSee>[0]

function employment(overrides: Partial<EmploymentLike> = {}): EmploymentLike {
  // Cast through unknown — we only exercise fields canSee actually reads.
  return {
    role: 'nurse',
    is_admin: false,
    ...overrides,
  } as unknown as EmploymentLike
}

describe('dashboard widgets: canSee', () => {
  describe('patients_in_care_widget', () => {
    it('is visible to any employee', () => {
      assertEquals(patients_in_care_widget.canSee(employment({ role: 'nurse' })), true)
      assertEquals(patients_in_care_widget.canSee(employment({ role: 'doctor' })), true)
      assertEquals(patients_in_care_widget.canSee(employment({ role: 'admin', is_admin: true })), true)
    })

    it('has a stable id', () => {
      assertEquals(patients_in_care_widget.id, 'patients_in_care')
    })
  })

  describe('encounters_in_range_widget', () => {
    it('is visible to any employee', () => {
      assertEquals(encounters_in_range_widget.canSee(employment({ role: 'nurse' })), true)
      assertEquals(encounters_in_range_widget.canSee(employment({ role: 'doctor' })), true)
      assertEquals(encounters_in_range_widget.id, 'encounters_in_range')
    })
  })

  describe('staff_on_shift_widget', () => {
    it('is visible to any employee', () => {
      assertEquals(staff_on_shift_widget.canSee(employment({ role: 'nurse' })), true)
      assertEquals(staff_on_shift_widget.canSee(employment({ role: 'admin', is_admin: true })), true)
      assertEquals(staff_on_shift_widget.id, 'staff_on_shift')
    })
  })
})
