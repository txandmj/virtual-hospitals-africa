import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { patientsInCareWidget } from './PatientsInCare.tsx'
import { encountersInRangeWidget } from './EncountersInRange.tsx'
import { staffOnShiftWidget } from './StaffOnShift.tsx'

export const DASHBOARD_WIDGETS: WidgetDef<unknown>[] = [
  patientsInCareWidget as WidgetDef<unknown>,
  encountersInRangeWidget as WidgetDef<unknown>,
  staffOnShiftWidget as WidgetDef<unknown>,
]
