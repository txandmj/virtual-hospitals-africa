import { Fragment } from 'preact'
import { PageProps } from 'fresh'
import FilterBar from '../components/dashboard/FilterBar.tsx'
import DateRangeInput from '../components/dashboard/filters/DateRangeInput.tsx'
import SelectInput from '../components/dashboard/filters/SelectInput.tsx'
import { parseDateRange, parseSelect } from '../util/dashboard/filters.ts'
import type { PreviewFilters } from '../util/dashboard/preview.ts'
import { EMPLOYEES, ORGANIZATIONS } from '../util/dashboard/fixtures.ts'
import { DEPARTMENT_LABELS } from '../scripts/generate_dashboard_fixtures.ts'
import { PREVIEW_DASHBOARD_WIDGETS } from '../components/dashboard/widgets/preview/index.ts'

const DEPARTMENT_VALUES = ['emergency', 'internal_medicine', 'obgyn', 'pediatrics', 'surgery', 'cardiology'] as const
const PAYER_VALUES = ['insurance', 'government', 'self_pay', 'ngo'] as const

function spanClass(span: number | undefined): string {
  switch (span ?? 4) {
    case 12:
      return 'col-span-12'
    case 6:
      return 'col-span-12 lg:col-span-6'
    case 8:
      return 'col-span-12 lg:col-span-8'
    case 3:
      return 'col-span-12 sm:col-span-6 lg:col-span-3'
    default:
      return 'col-span-12 sm:col-span-6 lg:col-span-4'
  }
}

export default function DashboardPreview({ url }: PageProps) {
  const date_range = parseDateRange(url)
  const organization_id = parseSelect(url, 'organization_id', ORGANIZATIONS.map((o) => o.id))
  const department = parseSelect(url, 'department', DEPARTMENT_VALUES)
  const payer = parseSelect(url, 'payer', PAYER_VALUES)
  const doctors = EMPLOYEES.filter((e) => e.role === 'doctor' && (!organization_id || e.organization_id === organization_id))
  const doctor_id = parseSelect(url, 'doctor_id', doctors.map((d) => d.id))

  const filters: PreviewFilters = {
    date_range,
    organization_id,
    department,
    doctor_id,
    payer,
  }

  const items = PREVIEW_DASHBOARD_WIDGETS.map((widget) => ({
    id: widget.id,
    span: widget.span,
    element: widget.render(widget.fetch(filters)),
  }))

  const department_options = DEPARTMENT_VALUES.map((value) => ({ value, label: DEPARTMENT_LABELS[value] }))
  const organization_options = ORGANIZATIONS.map((o) => ({ value: o.id, label: o.name }))
  const doctor_options = doctors.map((d) => ({
    value: d.id,
    label: `${d.name} (${DEPARTMENT_LABELS[d.specialty as keyof typeof DEPARTMENT_LABELS] ?? d.specialty ?? '—'})`,
  }))
  const payer_options = PAYER_VALUES.map((value) => ({
    value,
    label: value === 'self_pay' ? 'Self-pay' : value.charAt(0).toUpperCase() + value.slice(1),
  }))

  return (
    <div class='min-h-screen bg-gray-50 p-6'>
      <div class='mx-auto max-w-7xl'>
        <h1 class='mb-1 text-2xl font-semibold text-gray-900'>Dashboard Preview</h1>
        <p class='mb-4 text-sm text-gray-500'>
          Standalone preview of the executive dashboard. Data is loaded from <code>fixtures/dashboard/*.json</code> — regenerate with{' '}
          <code>deno run -A scripts/generate_dashboard_fixtures.ts</code>.
        </p>
        <FilterBar action={url.pathname}>
          <SelectInput param='organization_id' value={organization_id} options={organization_options} placeholder='All hospitals' />
          <SelectInput param='department' value={department} options={department_options} placeholder='All departments' />
          <SelectInput param='doctor_id' value={doctor_id} options={doctor_options} placeholder='All doctors' />
          <SelectInput param='payer' value={payer} options={payer_options} placeholder='All payers' />
          <DateRangeInput value={date_range} />
        </FilterBar>
        <div class='mt-4 grid grid-cols-12 gap-4'>
          {items.map(({ id, span, element }) => (
            <div key={id} class={spanClass(span)}>
              <Fragment>{element}</Fragment>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
