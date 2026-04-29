import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { billingFor, filterEncounters } from '../../../../util/dashboard/fixtures.ts'
import { DEPARTMENT_LABELS } from '../../../../scripts/generate_dashboard_fixtures.ts'
import WidgetCard from '../../WidgetCard.tsx'
import BarChart from '../../charts/BarChart.tsx'

type Data = {
  overall_avg: number
  encounter_count: number
  by_department: Array<{ department: string; avg: number; sample: number }>
}

function formatUsd(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`
}

export const costPerTreatmentWidget: PreviewWidgetDef<Data> = {
  id: 'cost_per_treatment',
  title: 'Average cost per treatment',
  span: 4,
  fetch: (filters) => {
    const { encounters } = filterEncounters(filters)
    const dept_totals = new Map<string, { sum: number; count: number }>()
    let overall_sum = 0
    let overall_count = 0
    for (const enc of encounters) {
      const line = billingFor(enc.id)
      if (!line) continue
      overall_sum += line.total_charge_usd
      overall_count += 1
      const entry = dept_totals.get(enc.department) ?? { sum: 0, count: 0 }
      entry.sum += line.total_charge_usd
      entry.count += 1
      dept_totals.set(enc.department, entry)
    }
    const by_department = Array.from(dept_totals.entries())
      .map(([dept, agg]) => ({
        department: DEPARTMENT_LABELS[dept as keyof typeof DEPARTMENT_LABELS] ?? dept,
        avg: agg.count === 0 ? 0 : agg.sum / agg.count,
        sample: agg.count,
      }))
      .sort((a, b) => b.avg - a.avg)
    return {
      overall_avg: overall_count === 0 ? 0 : overall_sum / overall_count,
      encounter_count: overall_count,
      by_department,
    }
  },
  render: ({ overall_avg, encounter_count, by_department }) => (
    <WidgetCard title='Avg cost per treatment' subtitle={`${encounter_count.toLocaleString()} encounters`}>
      <div class='text-3xl font-semibold text-gray-900'>{formatUsd(overall_avg)}</div>
      <div class='mt-3'>
        <BarChart
          data={by_department.map((row) => ({ label: row.department, value: Math.round(row.avg), hint: `(n=${row.sample})` }))}
          format={formatUsd}
        />
      </div>
    </WidgetCard>
  ),
}
