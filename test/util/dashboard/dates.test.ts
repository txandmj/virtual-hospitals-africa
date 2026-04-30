import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { todayUtc } from '../../../util/dashboard/dates.ts'

describe('util/dashboard/dates.ts', () => {
  describe('todayUtc', () => {
    it('returns a Date at 00:00:00.000 UTC of the current day', () => {
      const result = todayUtc()
      assertEquals(result.getUTCHours(), 0)
      assertEquals(result.getUTCMinutes(), 0)
      assertEquals(result.getUTCSeconds(), 0)
      assertEquals(result.getUTCMilliseconds(), 0)
    })

    it('matches the current UTC year/month/date', () => {
      const now = new Date()
      const result = todayUtc()
      assertEquals(result.getUTCFullYear(), now.getUTCFullYear())
      assertEquals(result.getUTCMonth(), now.getUTCMonth())
      assertEquals(result.getUTCDate(), now.getUTCDate())
    })
  })
})
