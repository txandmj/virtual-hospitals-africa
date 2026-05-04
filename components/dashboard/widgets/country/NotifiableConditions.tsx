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
  render: ({ rows, total }) => {
    const TOP_N = 15
    const visible = rows.slice(0, TOP_N).filter((r) => r.count > 0)
    const hidden_count = rows.length - visible.length
    const cat1_total = rows.filter((r) => r.condition.nmc_category === 1).reduce((s, r) => s + r.count, 0)
    const cat2_total = rows.filter((r) => r.condition.nmc_category === 2).reduce((s, r) => s + r.count, 0)
    return (
      <WidgetCard
        title='Notifiable conditions'
        subtitle={`Top ${visible.length} of ${rows.length} conditions — ${total.toLocaleString()} confirmed cases`}
      >
        <div class='mb-4 grid grid-cols-3 gap-3'>
          <Stat label='Total confirmed' value={total} accent='text-gray-900' />
          <Stat label='Category 1' value={cat1_total} accent='text-red-700' />
          <Stat label='Category 2' value={cat2_total} accent='text-blue-700' />
        </div>
        <StackedBarChart
          rows={visible.map(({ condition, count }) => ({
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
        {hidden_count > 0
          ? (
            <p class='mt-3 text-xs text-gray-500'>
              + {hidden_count} conditions with low / no recent counts not shown.
            </p>
          )
          : null}
      </WidgetCard>
    )
  },
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div class='rounded-md border border-gray-100 bg-gray-50 px-3 py-2'>
      <div class='text-[10px] font-medium uppercase tracking-wide text-gray-500'>{label}</div>
      <div class={`mt-0.5 text-lg font-semibold tabular-nums ${accent}`}>{value.toLocaleString()}</div>
    </div>
  )
}
