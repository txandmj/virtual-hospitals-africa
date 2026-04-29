import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { filterEncounters } from '../../../../util/dashboard/fixtures.ts'
import { DEPARTMENT_LABELS } from '../../../../scripts/generate_dashboard_fixtures.ts'
import WidgetCard from '../../WidgetCard.tsx'
import BarChart from '../../charts/BarChart.tsx'

type Data = {
  overall_days: number
  closed_count: number
  by_department: Array<{ department: string; days: number; sample: number }>
}

export const averageLengthOfStayWidget: PreviewWidgetDef<Data> = {
  id: 'avg_length_of_stay',
  title: 'Average length of stay',
  span: 4,
  fetch: (filters) => {
    const { encounters } = filterEncounters(filters)
    const closed = encounters.filter((e) => e.closed_at !== null)
    const dept_totals = new Map<string, { sum_days: number; count: number }>()
    let overall_sum = 0
    for (const enc of closed) {
      if (!enc.closed_at) continue
      const days = (new Date(enc.closed_at).getTime() - new Date(enc.created_at).getTime()) / 86_400_000
      overall_sum += days
      const entry = dept_totals.get(enc.department) ?? { sum_days: 0, count: 0 }
      entry.sum_days += days
      entry.count += 1
      dept_totals.set(enc.department, entry)
    }
    const by_department = Array.from(dept_totals.entries())
      .map(([dept, agg]) => ({
        department: DEPARTMENT_LABELS[dept as keyof typeof DEPARTMENT_LABELS] ?? dept,
        days: agg.count === 0 ? 0 : agg.sum_days / agg.count,
        sample: agg.count,
      }))
      .sort((a, b) => b.days - a.days)
    return {
      overall_days: closed.length === 0 ? 0 : overall_sum / closed.length,
      closed_count: closed.length,
      by_department,
    }
  },
  render: ({ overall_days, closed_count, by_department }) => (
    <WidgetCard title='Average length of stay' subtitle={`${closed_count.toLocaleString()} closed encounters`}>
      <div class='text-3xl font-semibold text-gray-900'>
        {overall_days.toFixed(1)} <span class='text-base font-normal text-gray-500'>days</span>
      </div>
      <div class='mt-3'>
        <BarChart
          data={by_department.map((row) => ({ label: row.department, value: Number(row.days.toFixed(1)), hint: `(n=${row.sample})` }))}
          format={(v) =>
            `${v.toFixed(1)}d`}
        />
      </div>
    </WidgetCard>
  ),
}
