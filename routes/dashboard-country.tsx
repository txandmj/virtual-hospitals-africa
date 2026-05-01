import { Fragment } from 'preact'
import { PageProps } from 'fresh'
import FilterBar from '../components/dashboard/FilterBar.tsx'
import DateRangeInput from '../components/dashboard/filters/DateRangeInput.tsx'
import { parseDateRange } from '../util/dashboard/filters.ts'
import type { CountryFilters } from '../util/dashboard/country.ts'
import { COUNTRY_DASHBOARD_WIDGETS } from '../components/dashboard/widgets/country/index.ts'

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

export default function DashboardCountry({ url }: PageProps) {
  const date_range = parseDateRange(url)
  const filters: CountryFilters = { date_range }

  const items = COUNTRY_DASHBOARD_WIDGETS.map((widget) => ({
    id: widget.id,
    span: widget.span,
    element: widget.render(widget.fetch(filters)),
  }))

  return (
    <div class='min-h-screen bg-gray-50 p-6'>
      <div class='mx-auto max-w-7xl'>
        <h1 class='mb-1 text-2xl font-semibold text-gray-900'>Country-wide surveillance</h1>
        <p class='mb-4 text-sm text-gray-500'>
          Standalone preview of the country-wide notifiable-conditions dashboard. Data is loaded from <code>fixtures/dashboard/*.json</code> — regenerate with
          {' '}
          <code>deno run -A scripts/generate_dashboard_fixtures.ts</code>.
        </p>
        <FilterBar action={url.pathname}>
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
