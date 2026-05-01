import type { CountryWidgetDef } from '../../../../util/dashboard/country.ts'
import { ENCOUNTERS } from '../../../../util/dashboard/fixtures.ts'
import { expectedCount, NOTIFIABLE_CONDITIONS, type NotifiableCondition } from '../../../../util/dashboard/notifiable_conditions.ts'
import WidgetCard from '../../WidgetCard.tsx'
import StackedBarChart from '../../charts/StackedBarChart.tsx'

const CATEGORY_COLORS: Record<1 | 2, string> = {
  1: '#dc2626',
  2: '#1d4ed8',
}

const CATEGORY_LABELS: Record<1 | 2, string> = {
  1: 'NMC Category 1 (acute / outbreak-prone)',
  2: 'NMC Category 2 (endemic / chronic)',
}

type Row = { condition: NotifiableCondition; count: number }
type Data = { rows: readonly Row[]; total: number }

function filteredEncounterCount(filters: { date_range: { from: Date | null; to: Date | null } }): number {
  const from_iso = filters.date_range.from?.toISOString() ?? null
  const to_iso = filters.date_range.to ? endOfDayIso(filters.date_range.to) : null
  let count = 0
  for (const enc of ENCOUNTERS) {
    if (from_iso && enc.created_at < from_iso) continue
    if (to_iso && enc.created_at >= to_iso) continue
    count++
  }
  return count
}

function endOfDayIso(d: Date): string {
  const next = new Date(d)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString()
}

export const notifiable_conditions_widget: CountryWidgetDef<Data> = {
  id: 'notifiable_conditions',
  title: 'Notifiable conditions',
  span: 12,
  fetch: (filters) => {
    const seed = filteredEncounterCount(filters)
    const rows: Row[] = NOTIFIABLE_CONDITIONS
      .map((condition) => ({ condition, count: expectedCount(seed, condition) }))
      .sort((a, b) => b.count - a.count)
    const total = rows.reduce((s, r) => s + r.count, 0)
    return { rows, total }
  },
  render: ({ rows, total }) => (
    <WidgetCard
      title='Notifiable conditions'
      subtitle={`Country-wide case counts across ${rows.length} conditions — ${total.toLocaleString()} confirmed total`}
    >
      <StackedBarChart
        rows={rows.map(({ condition, count }) => ({
          label: condition.label,
          segments: [{
            key: String(condition.nmc_category),
            label: CATEGORY_LABELS[condition.nmc_category],
            value: count,
            color: CATEGORY_COLORS[condition.nmc_category],
          }],
        }))}
        legend={[
          { key: '1', label: CATEGORY_LABELS[1], color: CATEGORY_COLORS[1] },
          { key: '2', label: CATEGORY_LABELS[2], color: CATEGORY_COLORS[2] },
        ]}
      />
    </WidgetCard>
  ),
}
