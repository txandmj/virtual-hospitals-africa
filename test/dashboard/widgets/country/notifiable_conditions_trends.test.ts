import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { notifiable_conditions_trends_widget } from '../../../../components/dashboard/widgets/country/NotifiableConditionsTrends.tsx'

const empty_filters = { date_range: { from: null, to: null } }

describe('notifiable_conditions_trends_widget.fetch', () => {
  it('produces 156 weeks', () => {
    const data = notifiable_conditions_trends_widget.fetch(empty_filters)
    assertEquals(data.weeks.length, 156)
  })

  it('produces 32 condition rows', () => {
    const data = notifiable_conditions_trends_widget.fetch(empty_filters)
    assertEquals(data.rows.length, 32)
  })

  it('confirms each row has weeks-many points for both series', () => {
    const data = notifiable_conditions_trends_widget.fetch(empty_filters)
    for (const row of data.rows) {
      assertEquals(row.confirmed.length, data.weeks.length)
      assertEquals(row.suspected.length, data.weeks.length)
    }
  })

  it('default_keys is the 8 Cat-1 conditions', () => {
    const data = notifiable_conditions_trends_widget.fetch(empty_filters)
    assertEquals(data.default_keys.length, 8)
    for (const key of data.default_keys) {
      const row = data.rows.find((r) => r.condition_key === key)
      assertEquals(row?.nmc_category, 1)
    }
  })

  it('output is deterministic', () => {
    const a = notifiable_conditions_trends_widget.fetch(empty_filters)
    const b = notifiable_conditions_trends_widget.fetch(empty_filters)
    assertEquals(a.rows[0].confirmed, b.rows[0].confirmed)
  })
})
