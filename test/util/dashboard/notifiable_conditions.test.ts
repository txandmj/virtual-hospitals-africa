import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { expectedCount, hashCount, NOTIFIABLE_CONDITIONS, PREVALENCE_WEIGHT } from '../../../util/dashboard/notifiable_conditions.ts'

describe('util/dashboard/notifiable_conditions.ts', () => {
  it('hashCount is deterministic for same inputs', () => {
    const a = hashCount(100, 'malaria', 50)
    const b = hashCount(100, 'malaria', 50)
    assertEquals(a, b)
  })

  it('hashCount stays inside [0, ceiling)', () => {
    for (let seed = 0; seed < 100; seed++) {
      const v = hashCount(seed, 'tb_pulmonary', 25)
      assertEquals(v >= 0 && v < 25, true)
    }
  })

  it('PREVALENCE_WEIGHT covers every notifiable condition', () => {
    for (const c of NOTIFIABLE_CONDITIONS) {
      const w = PREVALENCE_WEIGHT[c.key]
      assertEquals(typeof w, 'number')
      assertEquals(w > 0, true)
    }
  })

  it('expectedCount is deterministic per (seed, condition)', () => {
    const tb = NOTIFIABLE_CONDITIONS.find((c) => c.key === 'tb_pulmonary')!
    assertEquals(expectedCount(500, tb), expectedCount(500, tb))
  })
})
