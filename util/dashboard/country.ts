import type { JSX } from 'preact'
import type { DateRange } from './types.ts'

export type CountryFilters = {
  date_range: DateRange
}

export type CountryWidgetDef<Data> = {
  id: string
  title: string
  // Width in 12-column grid units. Defaults to 4. Country widgets typically use 12.
  span?: number
  fetch: (filters: CountryFilters) => Data
  render: (data: Data) => JSX.Element
}
