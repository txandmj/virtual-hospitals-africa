import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { filterEncounters } from '../../../../util/dashboard/fixtures.ts'
import { DEPARTMENT_LABELS } from '../../../../scripts/generate_dashboard_fixtures.ts'
import WidgetCard from '../../WidgetCard.tsx'
import BarChart from '../../charts/BarChart.tsx'

type Data = {
  overall_pct: number
  readmissions: number
  total: number
  by_department: Array<{ department: string; pct: number; sample: number }>
}

export const readmission_rate_widget: PreviewWidgetDef<Data> = {
  id: 'readmission_rate',
  title: '30-day readmission rate',
  span: 4,
  fetch: (filters) => {
    const { encounters } = filterEncounters(filters)
    const dept_totals = new Map<string, { readmits: number; total: number }>()
    let total_readmits = 0
    for (const enc of encounters) {
      const entry = dept_totals.get(enc.department) ?? { readmits: 0, total: 0 }
      entry.total += 1
      if (enc.is_readmission) {
        entry.readmits += 1
        total_readmits += 1
      }
      dept_totals.set(enc.department, entry)
    }
    const by_department = Array.from(dept_totals.entries())
      .map(([dept, counts]) => ({
        department: DEPARTMENT_LABELS[dept as keyof typeof DEPARTMENT_LABELS] ?? dept,
        pct: counts.total === 0 ? 0 : (counts.readmits / counts.total) * 100,
        sample: counts.total,
      }))
      .sort((a, b) => b.pct - a.pct)
    return {
      overall_pct: encounters.length === 0 ? 0 : (total_readmits / encounters.length) * 100,
      readmissions: total_readmits,
      total: encounters.length,
      by_department,
    }
  },
  render: ({ overall_pct, readmissions, total, by_department }) => (
    <WidgetCard title='30-day readmission rate' subtitle={`${readmissions} of ${total.toLocaleString()} encounters`}>
      <div class='text-3xl font-semibold text-gray-900'>{overall_pct.toFixed(1)}%</div>
      <div class='mt-3'>
        <BarChart
          data={by_department.map((row) => ({ label: row.department, value: Number(row.pct.toFixed(1)), hint: `(n=${row.sample})` }))}
          format={(v) =>
            `${v.toFixed(1)}%`}
        />
      </div>
    </WidgetCard>
  ),
}
