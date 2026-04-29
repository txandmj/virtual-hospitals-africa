import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { BILLING, filterEncounters } from '../../../../util/dashboard/fixtures.ts'
import { DEPARTMENT_LABELS } from '../../../../scripts/generate_dashboard_fixtures.ts'
import WidgetCard from '../../WidgetCard.tsx'
import LineChart from '../../charts/LineChart.tsx'

const DEPARTMENT_COLORS: Record<string, string> = {
  emergency: '#dc2626',
  internal_medicine: '#2563eb',
  obgyn: '#db2777',
  pediatrics: '#16a34a',
  surgery: '#9333ea',
  cardiology: '#ea580c',
}

type DailyBucket = {
  day: string
  encounters_by_dept: Map<string, number>
  revenue_by_dept: Map<string, number>
}

type Data = {
  days: string[]
  encounters_series: Array<{ key: string; label: string; color: string; points: number[] }>
  revenue_series: Array<{ key: string; label: string; color: string; points: number[] }>
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

function shortLabel(day: string): string {
  // 2026-04-01 -> Apr 1
  const d = new Date(`${day}T00:00:00Z`)
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  return `${month} ${d.getUTCDate()}`
}

function formatUsd(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`
  return `$${Math.round(amount)}`
}

export const performanceTrendsWidget: PreviewWidgetDef<Data> = {
  id: 'performance_trends',
  title: 'Performance trends',
  span: 12,
  fetch: (filters) => {
    const { encounters } = filterEncounters(filters)
    const billing_index = new Map(BILLING.map((line) => [line.encounter_id, line]))

    const buckets = new Map<string, DailyBucket>()
    const departments_seen = new Set<string>()
    for (const enc of encounters) {
      const day = dayKey(enc.created_at)
      const bucket = buckets.get(day) ?? {
        day,
        encounters_by_dept: new Map<string, number>(),
        revenue_by_dept: new Map<string, number>(),
      }
      bucket.encounters_by_dept.set(enc.department, (bucket.encounters_by_dept.get(enc.department) ?? 0) + 1)
      const line = billing_index.get(enc.id)
      if (line) {
        bucket.revenue_by_dept.set(enc.department, (bucket.revenue_by_dept.get(enc.department) ?? 0) + line.total_charge_usd)
      }
      departments_seen.add(enc.department)
      buckets.set(day, bucket)
    }

    const days = Array.from(buckets.keys()).sort()
    const departments = Array.from(departments_seen).sort()

    function buildSeries(extract: (b: DailyBucket, d: string) => number) {
      return departments.map((dept) => ({
        key: dept,
        label: DEPARTMENT_LABELS[dept as keyof typeof DEPARTMENT_LABELS] ?? dept,
        color: DEPARTMENT_COLORS[dept] ?? '#6b7280',
        points: days.map((d) => {
          const bucket = buckets.get(d)
          return bucket ? extract(bucket, dept) : 0
        }),
      }))
    }

    return {
      days: days.map(shortLabel),
      encounters_series: buildSeries((b, d) => b.encounters_by_dept.get(d) ?? 0),
      revenue_series: buildSeries((b, d) => b.revenue_by_dept.get(d) ?? 0),
    }
  },
  render: ({ days, encounters_series, revenue_series }) => (
    <WidgetCard title='Performance trends' subtitle='Daily admissions and revenue by department'>
      <div class='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div>
          <div class='mb-2 text-xs font-medium uppercase tracking-wide text-gray-500'>Encounters per day</div>
          <LineChart x_labels={days} series={encounters_series} />
        </div>
        <div>
          <div class='mb-2 text-xs font-medium uppercase tracking-wide text-gray-500'>Revenue per day</div>
          <LineChart x_labels={days} series={revenue_series} format={formatUsd} />
        </div>
      </div>
    </WidgetCard>
  ),
}
