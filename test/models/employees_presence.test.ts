import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { TrxOrDb } from '../../types.ts'
import { employees_presence } from '../../db/models/employees_presence.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import { createTestOrganization } from '../_helpers/organizations.ts'
import { addTestEmployee } from '../_helpers/employees.ts'

// Employees are added sequentially so their auto-incremented seniority_order is
// deterministic (1, 2, 3, ... in insertion order, per organization).
async function addEmployeeAtWork(
  trx: TrxOrDb,
  organization_id: string,
  at_work: boolean,
) {
  const employee = await addTestEmployee(trx, {
    organization_id,
    role: 'nurse',
  })
  await trx.insertInto('employment_presence')
    .values({ id: employee.employee_id, at_work })
    .execute()
  return employee
}

describe('db/models/employees_presence.ts', () => {
  afterAll(() => db.destroy())

  describe('getAllAtOrganization', () => {
    itUsesTrxAnd(
      'orders employees at_work first, then by ascending seniority within each group',
      async (trx) => {
        const organization = await createTestOrganization(trx)

        // seniority_order is assigned in insertion order: 1, 2, 3, 4.
        const most_senior_absent = await addEmployeeAtWork(trx, organization.id, false) // seniority 1
        const senior_present = await addEmployeeAtWork(trx, organization.id, true) // seniority 2
        const junior_present = await addEmployeeAtWork(trx, organization.id, true) // seniority 3
        const junior_absent = await addEmployeeAtWork(trx, organization.id, false) // seniority 4

        const results = await employees_presence.getAllAtOrganization(trx, {
          organization_id: organization.id,
        })

        // at_work=true (sorted by seniority) come before at_work=false (sorted by seniority)
        assertEquals(
          results.map((r) => r.employee_id),
          [
            senior_present.employee_id, // at_work, seniority 2
            junior_present.employee_id, // at_work, seniority 3
            most_senior_absent.employee_id, // absent, seniority 1
            junior_absent.employee_id, // absent, seniority 4
          ],
        )

        assertEquals(
          results.map((r) => r.at_work),
          [true, true, false, false],
        )
        assertEquals(
          results.map((r) => r.seniority_order),
          [2, 3, 1, 4],
        )

        // senior_on_staff is the most senior employee regardless of presence.
        assertEquals(
          results.map((r) => r.senior_on_staff),
          [false, false, true, false],
        )
        assertEquals(
          results.find((r) => r.senior_on_staff)?.employee_id,
          most_senior_absent.employee_id,
        )

        // senior_on_duty is the most senior employee who is actually at work.
        assertEquals(
          results.map((r) => r.senior_on_duty),
          [true, false, false, false],
        )
        assertEquals(
          results.find((r) => r.senior_on_duty)?.employee_id,
          senior_present.employee_id,
        )
      },
    )
  })
})
