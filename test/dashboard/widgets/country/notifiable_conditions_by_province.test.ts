import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { notifiable_conditions_by_province_widget } from '../../../../components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx'
import { PROVINCES } from '../../../../util/dashboard/provinces.ts'

const empty_filters = { date_range: { from: null, to: null } }

describe('notifiable_conditions_by_province_widget.fetch', () => {
  it('returns provinces in canonical order', () => {
    const data = notifiable_conditions_by_province_widget.fetch(empty_filters)
    assertEquals(data.provinces, [...PROVINCES])
  })

  it('emits 32 condition rows', () => {
    const data = notifiable_conditions_by_province_widget.fetch(empty_filters)
    assertEquals(data.rows.length, 32)
  })

  it('each row has 9 cells, one per province', () => {
    const data = notifiable_conditions_by_province_widget.fetch(empty_filters)
    for (const row of data.rows) {
      assertEquals(row.cells.length, 9)
      assertEquals(row.cells.map((c) => c.province), [...PROVINCES])
    }
  })

  it('split is 8 Cat-1 and 24 Cat-2 rows', () => {
    const data = notifiable_conditions_by_province_widget.fetch(empty_filters)
    const cat1 = data.rows.filter((r) => r.nmc_category === 1).length
    const cat2 = data.rows.filter((r) => r.nmc_category === 2).length
    assertEquals(cat1, 8)
    assertEquals(cat2, 24)
  })

  it('output is deterministic', () => {
    const a = notifiable_conditions_by_province_widget.fetch(empty_filters)
    const b = notifiable_conditions_by_province_widget.fetch(empty_filters)
    assertEquals(a.rows[0].cells, b.rows[0].cells)
  })
})
