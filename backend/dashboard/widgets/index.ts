import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { patients_in_care_widget } from './PatientsInCare.tsx'
import { encounters_in_range_widget } from './EncountersInRange.tsx'
import { staff_on_shift_widget } from './StaffOnShift.tsx'

export const DASHBOARD_WIDGETS: WidgetDef<unknown>[] = [
  patients_in_care_widget as WidgetDef<unknown>,
  encounters_in_range_widget as WidgetDef<unknown>,
  staff_on_shift_widget as WidgetDef<unknown>,
]
