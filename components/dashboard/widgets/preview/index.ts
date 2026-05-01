import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { current_census_widget } from './CurrentCensus.tsx'
import { doctors_on_duty_widget } from './DoctorsOnDuty.tsx'
import { occupancy_rate_widget } from './OccupancyRate.tsx'
import { average_length_of_stay_widget } from './AverageLengthOfStay.tsx'
import { readmission_rate_widget } from './ReadmissionRate.tsx'
import { patient_movement_widget } from './PatientMovement.tsx'
import { cost_per_treatment_widget } from './CostPerTreatment.tsx'
import { income_by_source_widget } from './IncomeBySource.tsx'
import { cost_by_department_widget } from './CostByDepartment.tsx'
import { performance_trends_widget } from './PerformanceTrends.tsx'
import { notifiable_conditions_widget } from './NotifiableConditions.tsx'

// Render order, top-to-bottom. Span values determine grid layout in the preview route.
export const PREVIEW_DASHBOARD_WIDGETS: ReadonlyArray<PreviewWidgetDef<unknown>> = [
  current_census_widget,
  doctors_on_duty_widget,
  occupancy_rate_widget,
  average_length_of_stay_widget,
  readmission_rate_widget,
  cost_per_treatment_widget,
  patient_movement_widget,
  income_by_source_widget,
  cost_by_department_widget,
  performance_trends_widget,
  notifiable_conditions_widget,
] as ReadonlyArray<PreviewWidgetDef<unknown>>
