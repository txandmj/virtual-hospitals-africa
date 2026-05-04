import type { CountryWidgetDef } from '../../../../util/dashboard/country.ts'
import { notifiable_conditions_widget } from './NotifiableConditions.tsx'
import { notifiable_conditions_trends_widget } from './NotifiableConditionsTrends.tsx'
import { notifiable_conditions_by_province_widget } from './NotifiableConditionsByProvince.tsx'

export const COUNTRY_DASHBOARD_WIDGETS: ReadonlyArray<CountryWidgetDef<unknown>> = [
  notifiable_conditions_widget,
  notifiable_conditions_trends_widget,
  notifiable_conditions_by_province_widget,
] as ReadonlyArray<CountryWidgetDef<unknown>>
