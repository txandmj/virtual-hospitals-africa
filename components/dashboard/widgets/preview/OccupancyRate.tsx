import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { filterBeds } from '../../../../util/dashboard/fixtures.ts'
import { DEPARTMENT_LABELS } from '../../../../scripts/generate_dashboard_fixtures.ts'
import WidgetCard from '../../WidgetCard.tsx'
import BarChart from '../../charts/BarChart.tsx'

type DepartmentRow = { department: string; total: number; occupied: number; pct: number }

type Data = {
  overall_pct: number
  occupied: number
  total: number
  by_department: DepartmentRow[]
}

export const occupancyRateWidget: PreviewWidgetDef<Data> = {
  id: 'occupancy_rate',
  title: 'Bed occupancy',
  span: 4,
  fetch: (filters) => {
    const beds = filterBeds(filters)
    const occupied = beds.reduce((s, b) => s + b.occupied_beds, 0)
    const total = beds.reduce((s, b) => s + b.total_beds, 0)
    const dept_map = new Map<string, { total: number; occupied: number }>()
    for (const b of beds) {
      const entry = dept_map.get(b.department) ?? { total: 0, occupied: 0 }
      entry.total += b.total_beds
      entry.occupied += b.occupied_beds
      dept_map.set(b.department, entry)
    }
    const by_department: DepartmentRow[] = Array.from(dept_map.entries())
      .map(([dept, counts]) => ({
        department: DEPARTMENT_LABELS[dept as keyof typeof DEPARTMENT_LABELS] ?? dept,
        total: counts.total,
        occupied: counts.occupied,
        pct: counts.total === 0 ? 0 : (counts.occupied / counts.total) * 100,
      }))
      .sort((a, b) => b.pct - a.pct)
    return {
      overall_pct: total === 0 ? 0 : (occupied / total) * 100,
      occupied,
      total,
      by_department,
    }
  },
  render: ({ overall_pct, occupied, total, by_department }) => (
    <WidgetCard title='Bed occupancy' subtitle={`${occupied} / ${total} beds`}>
      <div class='text-3xl font-semibold text-gray-900'>{overall_pct.toFixed(0)}%</div>
      <div class='mt-3'>
        <BarChart
          data={by_department.map((row) => ({
            label: row.department,
            value: Math.round(row.pct),
            hint: `(${row.occupied}/${row.total})`,
          }))}
          format={(v) => `${v}%`}
        />
      </div>
    </WidgetCard>
  ),
}
