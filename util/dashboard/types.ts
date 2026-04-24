import type { JSX } from 'preact'
import type { HealthWorkerOrganization, TrxOrDb } from '../../types.ts'

export type DateRange = {
  from: Date | null
  to: Date | null
}

export type DashboardFilters = {
  date_range: DateRange
}

export type WidgetContext = {
  trx: TrxOrDb
  organization_id: string
  employment: HealthWorkerOrganization
}

export interface WidgetDef<Data> {
  id: string
  canSee(employment: HealthWorkerOrganization): boolean
  fetch(ctx: WidgetContext, filters: DashboardFilters): Promise<Data>
  render(data: Data): JSX.Element
}
