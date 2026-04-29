import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { filterEncounters } from '../../../../util/dashboard/fixtures.ts'
import { DEPARTMENT_LABELS } from '../../../../scripts/generate_dashboard_fixtures.ts'
import WidgetCard from '../../WidgetCard.tsx'
import BarChart from '../../charts/BarChart.tsx'

type Data = {
  admissions: number
  discharges: number
  net_change: number
  by_department: Array<{ department: string; admissions: number; discharges: number }>
}

// Looks at the most recent 7 days within the filter range and counts admits vs discharges per department.
export const patientMovementWidget: PreviewWidgetDef<Data> = {
  id: 'patient_movement',
  title: 'Patient movement (last 7 days)',
  span: 6,
  fetch: (filters) => {
    const { encounters } = filterEncounters(filters)
    const window_end = filters.date_range.to ?? new Date()
    const window_start = new Date(window_end)
    window_start.setUTCDate(window_start.getUTCDate() - 6)
    const window_start_iso = window_start.toISOString()
    const window_end_iso = new Date(window_end.getTime() + 86_400_000).toISOString()

    const dept_totals = new Map<string, { admissions: number; discharges: number }>()
    let admissions = 0
    let discharges = 0
    for (const enc of encounters) {
      const entry = dept_totals.get(enc.department) ?? { admissions: 0, discharges: 0 }
      if (enc.created_at >= window_start_iso && enc.created_at < window_end_iso) {
        entry.admissions += 1
        admissions += 1
      }
      if (enc.closed_at && enc.closed_at >= window_start_iso && enc.closed_at < window_end_iso) {
        entry.discharges += 1
        discharges += 1
      }
      dept_totals.set(enc.department, entry)
    }
    const by_department = Array.from(dept_totals.entries())
      .map(([dept, counts]) => ({
        department: DEPARTMENT_LABELS[dept as keyof typeof DEPARTMENT_LABELS] ?? dept,
        admissions: counts.admissions,
        discharges: counts.discharges,
      }))
      .filter((row) => row.admissions > 0 || row.discharges > 0)
      .sort((a, b) => (b.admissions + b.discharges) - (a.admissions + a.discharges))
    return { admissions, discharges, net_change: admissions - discharges, by_department }
  },
  render: ({ admissions, discharges, net_change, by_department }) => (
    <WidgetCard title='Patient movement' subtitle='Admissions vs discharges in the last 7 days'>
      <div class='flex gap-6'>
        <div>
          <div class='text-xs uppercase tracking-wide text-gray-500'>Admissions</div>
          <div class='text-2xl font-semibold text-gray-900'>{admissions}</div>
        </div>
        <div>
          <div class='text-xs uppercase tracking-wide text-gray-500'>Discharges</div>
          <div class='text-2xl font-semibold text-gray-900'>{discharges}</div>
        </div>
        <div>
          <div class='text-xs uppercase tracking-wide text-gray-500'>Net change</div>
          <div class={`text-2xl font-semibold ${net_change >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {net_change >= 0 ? '+' : ''}
            {net_change}
          </div>
        </div>
      </div>
      <div class='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <div class='mb-2 text-xs font-medium uppercase tracking-wide text-gray-500'>Admissions</div>
          <BarChart data={by_department.map((row) => ({ label: row.department, value: row.admissions }))} />
        </div>
        <div>
          <div class='mb-2 text-xs font-medium uppercase tracking-wide text-gray-500'>Discharges</div>
          <BarChart data={by_department.map((row) => ({ label: row.department, value: row.discharges }))} />
        </div>
      </div>
    </WidgetCard>
  ),
}
