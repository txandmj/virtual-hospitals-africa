import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { currentCensusWidget } from './CurrentCensus.tsx'
import { doctorsOnDutyWidget } from './DoctorsOnDuty.tsx'
import { occupancyRateWidget } from './OccupancyRate.tsx'
import { averageLengthOfStayWidget } from './AverageLengthOfStay.tsx'
import { readmissionRateWidget } from './ReadmissionRate.tsx'
import { patientMovementWidget } from './PatientMovement.tsx'
import { costPerTreatmentWidget } from './CostPerTreatment.tsx'
import { incomeBySourceWidget } from './IncomeBySource.tsx'
import { costByDepartmentWidget } from './CostByDepartment.tsx'
import { performanceTrendsWidget } from './PerformanceTrends.tsx'

// Render order, top-to-bottom. Span values determine grid layout in the preview route.
export const PREVIEW_DASHBOARD_WIDGETS: ReadonlyArray<PreviewWidgetDef<unknown>> = [
  currentCensusWidget,
  doctorsOnDutyWidget,
  occupancyRateWidget,
  averageLengthOfStayWidget,
  readmissionRateWidget,
  costPerTreatmentWidget,
  patientMovementWidget,
  incomeBySourceWidget,
  costByDepartmentWidget,
  performanceTrendsWidget,
] as ReadonlyArray<PreviewWidgetDef<unknown>>
