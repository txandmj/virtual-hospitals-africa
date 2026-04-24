import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { parseDateRange } from '../../../util/dashboard/filters.ts'

function url(query: string): URL {
  return new URL(`https://example.test/x?${query}`)
}

describe('util/dashboard/filters.ts', () => {
  describe('parseDateRange', () => {
    it('returns { null, null } when neither param is present', () => {
      const r = parseDateRange(url(''))
      assertEquals(r.from, null)
      assertEquals(r.to, null)
    })

    it('parses valid ISO date params (from, to)', () => {
      const r = parseDateRange(url('from=2026-04-01&to=2026-04-24'))
      assertEquals(r.from?.toISOString(), '2026-04-01T00:00:00.000Z')
      assertEquals(r.to?.toISOString(),   '2026-04-24T00:00:00.000Z')
    })

    it('accepts only one side of the range', () => {
      const r = parseDateRange(url('from=2026-04-01'))
      assertEquals(r.from?.toISOString(), '2026-04-01T00:00:00.000Z')
      assertEquals(r.to, null)
    })

    it('returns null for malformed values', () => {
      const r = parseDateRange(url('from=not-a-date&to=also-bad'))
      assertEquals(r.from, null)
      assertEquals(r.to, null)
    })

    it('honors the prefix', () => {
      const r = parseDateRange(url('encounter_from=2026-04-01'), 'encounter_')
      assertEquals(r.from?.toISOString(), '2026-04-01T00:00:00.000Z')
    })
  })
})
