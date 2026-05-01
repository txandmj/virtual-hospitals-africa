import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { type Province, PROVINCE_LABELS, PROVINCE_POPULATION_WEIGHT, PROVINCES, provinceForOrganization } from '../../../util/dashboard/provinces.ts'

describe('util/dashboard/provinces.ts', () => {
  it('PROVINCES contains all 9 SA provinces in display order', () => {
    assertEquals(PROVINCES.length, 9)
    assertEquals(PROVINCES, ['EC', 'FS', 'GP', 'KZN', 'LP', 'MP', 'NC', 'NW', 'WC'])
  })

  it('PROVINCE_LABELS has a full name for every province', () => {
    for (const province of PROVINCES) {
      const label = PROVINCE_LABELS[province]
      assertEquals(typeof label, 'string')
      assertEquals(label.length > 0, true)
    }
    assertEquals(PROVINCE_LABELS.GP, 'Gauteng')
    assertEquals(PROVINCE_LABELS.KZN, 'KwaZulu-Natal')
  })

  it('PROVINCE_POPULATION_WEIGHT covers every province and sums to ~1.0', () => {
    let sum = 0
    for (const p of PROVINCES) {
      const w: number = PROVINCE_POPULATION_WEIGHT[p as Province]
      assertEquals(w > 0, true)
      sum += w
    }
    assertEquals(Math.abs(sum - 1) < 0.001, true)
  })
})

describe('provinceForOrganization', () => {
  it('returns the province for a known org id', () => {
    assertEquals(provinceForOrganization('org_durban'), 'KZN')
  })

  it('returns null for an unknown org id', () => {
    assertEquals(provinceForOrganization('org_does_not_exist'), null)
  })
})
