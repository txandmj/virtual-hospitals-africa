import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { filterEmployees } from '../../../../util/dashboard/fixtures.ts'
import { DEPARTMENT_LABELS } from '../../../../scripts/generate_dashboard_fixtures.ts'
import WidgetCard from '../../WidgetCard.tsx'

type Data = {
  on_duty: number
  total_doctors: number
  by_specialty: Array<{ specialty: string; on_duty: number; total: number }>
}

export const doctorsOnDutyWidget: PreviewWidgetDef<Data> = {
  id: 'doctors_on_duty',
  title: 'Doctors on duty',
  span: 4,
  fetch: (filters) => {
    const doctors = filterEmployees(filters).filter((e) => e.role === 'doctor')
    const by_specialty_map = new Map<string, { on_duty: number; total: number }>()
    for (const doc of doctors) {
      const key = doc.specialty ?? 'general'
      const entry = by_specialty_map.get(key) ?? { on_duty: 0, total: 0 }
      entry.total += 1
      if (doc.at_work) entry.on_duty += 1
      by_specialty_map.set(key, entry)
    }
    const by_specialty = Array.from(by_specialty_map.entries())
      .map(([specialty, counts]) => ({
        specialty: DEPARTMENT_LABELS[specialty as keyof typeof DEPARTMENT_LABELS] ?? specialty,
        on_duty: counts.on_duty,
        total: counts.total,
      }))
      .sort((a, b) => b.total - a.total)
    return {
      on_duty: doctors.filter((d) => d.at_work).length,
      total_doctors: doctors.length,
      by_specialty,
    }
  },
  render: ({ on_duty, total_doctors, by_specialty }) => (
    <WidgetCard title='Doctors on duty'>
      <div class='flex items-baseline gap-2'>
        <span class='text-3xl font-semibold text-gray-900'>{on_duty}</span>
        <span class='text-sm text-gray-500'>of {total_doctors}</span>
      </div>
      {by_specialty.length > 0
        ? (
          <ul class='mt-3 space-y-1 text-xs text-gray-600'>
            {by_specialty.map((row) => (
              <li key={row.specialty} class='flex justify-between'>
                <span>{row.specialty}</span>
                <span>
                  <span class='font-medium text-gray-800'>{row.on_duty}</span>
                  <span class='text-gray-400'>/{row.total}</span>
                </span>
              </li>
            ))}
          </ul>
        )
        : null}
    </WidgetCard>
  ),
}
