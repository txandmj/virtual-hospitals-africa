import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import generateUUID from '../../util/uuid.ts'
import { patients } from '../../db/models/patients.ts'
import { dashboard_metrics } from '../../db/models/dashboard_metrics.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import { TEST_ORGANIZATION_UUIDS } from '../_helpers/organizations.ts'

const ORG_A = TEST_ORGANIZATION_UUIDS.ZA.clinic
const ORG_B = TEST_ORGANIZATION_UUIDS.ZA.hospital

describe('db/models/dashboard_metrics.ts', () => {
  afterAll(() => db.destroy())

  describe('patientsCurrentlyInEncounter', () => {
    itUsesTrxAnd('counts only open encounters at this org', async (trx) => {
      const [p1, p2, p3] = await Promise.all([
        patients.insert(trx, { name: 'Patient ' + generateUUID() }),
        patients.insert(trx, { name: 'Patient ' + generateUUID() }),
        patients.insert(trx, { name: 'Patient ' + generateUUID() }),
      ])

      // open at ORG_A — counts
      await trx.insertInto('patient_encounters').values({
        id: generateUUID(), patient_id: p1.id, organization_id: ORG_A,
        location: 'POINT(0 0)', reason: 'seeking treatment',
      }).execute()

      // closed at ORG_A — does NOT count
      await trx.insertInto('patient_encounters').values({
        id: generateUUID(), patient_id: p2.id, organization_id: ORG_A,
        location: 'POINT(0 0)', reason: 'seeking treatment', closed_at: new Date(),
      }).execute()

      // open at ORG_B — does NOT count for ORG_A
      await trx.insertInto('patient_encounters').values({
        id: generateUUID(), patient_id: p3.id, organization_id: ORG_B,
        location: 'POINT(0 0)', reason: 'seeking treatment',
      }).execute()

      const count = await dashboard_metrics.patientsCurrentlyInEncounter(
        trx, { organization_id: ORG_A },
      )
      assertEquals(count, 1)
    })
  })

  describe('encountersInRange', () => {
    itUsesTrxAnd('counts encounters at this org with created_at in the day-inclusive range', async (trx) => {
      const [p1, p2, p3] = await Promise.all([
        patients.insert(trx, { name: 'Patient ' + generateUUID() }),
        patients.insert(trx, { name: 'Patient ' + generateUUID() }),
        patients.insert(trx, { name: 'Patient ' + generateUUID() }),
      ])

      const insertAt = (patient_id: string, organization_id: string, created_at: Date) =>
        trx.insertInto('patient_encounters').values({
          id: generateUUID(), patient_id, organization_id,
          location: 'POINT(0 0)', reason: 'seeking treatment', created_at,
        }).execute()

      await insertAt(p1.id, ORG_A, new Date('2026-04-20T10:00:00Z'))  // IN range
      await insertAt(p2.id, ORG_A, new Date('2026-04-24T23:59:00Z'))  // IN range (end of day)
      await insertAt(p3.id, ORG_A, new Date('2026-04-25T00:00:00Z'))  // OUT (day after)
      await insertAt(p1.id, ORG_B, new Date('2026-04-22T10:00:00Z'))  // OUT (wrong org)

      const count = await dashboard_metrics.encountersInRange(trx, {
        organization_id: ORG_A,
        from: new Date('2026-04-20T00:00:00Z'),
        to:   new Date('2026-04-24T00:00:00Z'),
      })
      assertEquals(count, 2)
    })
  })
})
