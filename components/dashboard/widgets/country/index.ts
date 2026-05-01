import type { CountryWidgetDef } from '../../../../util/dashboard/country.ts'
import { notifiable_conditions_widget } from './NotifiableConditions.tsx'

export const COUNTRY_DASHBOARD_WIDGETS: ReadonlyArray<CountryWidgetDef<unknown>> = [
  notifiable_conditions_widget,
] as ReadonlyArray<CountryWidgetDef<unknown>>
