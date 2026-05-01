import type { CountryWidgetDef } from '../../../../util/dashboard/country.ts'
import { notifiable_conditions_widget } from './NotifiableConditions.tsx'
import { notifiable_conditions_trends_widget } from './NotifiableConditionsTrends.tsx'

export const COUNTRY_DASHBOARD_WIDGETS: ReadonlyArray<CountryWidgetDef<unknown>> = [
  notifiable_conditions_widget,
  notifiable_conditions_trends_widget,
] as ReadonlyArray<CountryWidgetDef<unknown>>
