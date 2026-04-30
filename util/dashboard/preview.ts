import type { JSX } from 'preact'
import type { DateRange } from './types.ts'

export type PreviewFilters = {
  date_range: DateRange
  organization_id: string | null
  department: string | null
  doctor_id: string | null
  payer: string | null
}

export type PreviewWidgetDef<Data> = {
  id: string
  title: string
  // Width in 12-column grid units. Defaults to 4 (one-third). Trend charts use 12.
  span?: number
  fetch: (filters: PreviewFilters) => Data
  render: (data: Data) => JSX.Element
}
