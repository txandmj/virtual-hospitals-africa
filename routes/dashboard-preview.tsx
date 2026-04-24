import { PageProps } from 'fresh'
import Card from '../components/dashboard/Card.tsx'
import FilterBar from '../components/dashboard/FilterBar.tsx'
import DateRangeInput from '../components/dashboard/filters/DateRangeInput.tsx'
import { parseDateRange } from '../util/dashboard/filters.ts'
import { todayUtc } from '../util/dashboard/dates.ts'

const PATIENTS_IN_CARE_FAKE = 12
const STAFF_ON_SHIFT_FAKE = 5
const ENCOUNTERS_PER_DAY_FAKE = 23

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.floor(ms / 86_400_000) + 1
}

export default function DashboardPreview({ url }: PageProps) {
  const date_range = parseDateRange(url)
  const from = date_range.from ?? todayUtc()
  const to = date_range.to ?? todayUtc()
  const encounters_in_range = ENCOUNTERS_PER_DAY_FAKE * daysBetween(from, to)

  return (
    <div class='min-h-screen bg-gray-50 p-6'>
      <div class='mx-auto max-w-5xl'>
        <h1 class='mb-4 text-2xl font-semibold text-gray-900'>
          Dashboard Preview
        </h1>
        <p class='mb-4 text-sm text-gray-500'>
          Standalone preview of the dashboard shell with fake data. The real page at <code>/app/organizations/:id/dashboard</code>{' '}
          uses live queries behind auth.
        </p>
        <FilterBar action={url.pathname}>
          <DateRangeInput value={date_range} />
        </FilterBar>
        <div class='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <Card label='Patients in care' value={PATIENTS_IN_CARE_FAKE} />
          <Card label='Encounters in range' value={encounters_in_range} />
          <Card label='Staff on shift' value={STAFF_ON_SHIFT_FAKE} />
        </div>
      </div>
    </div>
  )
}
