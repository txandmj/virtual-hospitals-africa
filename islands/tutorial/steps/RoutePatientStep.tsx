// =============================================================================
// FILE: /islands/tutorial/steps/RoutePatientStep.tsx
// Route patient step - wraps RegistrationRoutePatientSection with mock data
// =============================================================================

import { applyPermissions } from '../../../shared/permissions.ts'
import { triageNextStepRecommendations } from '../../../shared/triage_route_patient.ts'
import {
  getTutorialRoutePatientData,
  TUTORIAL_CLINIC_EMPLOYEES,
  TUTORIAL_MANAGE_PATIENT_TASKS,
  TUTORIAL_ORGANIZATION_EMPLOYMENT,
} from '../../../shared/tutorial/mock-data.ts'
import TriageRoutePatientSection from '../../triage/RoutePatientSection.tsx'

/**
 * Route patient step for tutorial.
 * Shows routing options after triage is complete.
 */
export function RoutePatientStep() {
  const { this_visit, patient_names } = getTutorialRoutePatientData()
  const priority = {
    name: 'Urgent' as const,
    target_treatment_time: new Date(),
  }

  const tasks_with_permissions = applyPermissions(TUTORIAL_ORGANIZATION_EMPLOYMENT, TUTORIAL_CLINIC_EMPLOYEES, TUTORIAL_MANAGE_PATIENT_TASKS)
  const triage_next_step_recommendations = triageNextStepRecommendations(priority.name, TUTORIAL_CLINIC_EMPLOYEES, tasks_with_permissions)

  return (
    <div data-tutorial='route-patient'>
      <TriageRoutePatientSection
        this_visit={this_visit}
        patient={{
          names: patient_names,
          gender: 'woman',
        }}
        priority={priority}
        clinic_employees={TUTORIAL_CLINIC_EMPLOYEES}
        tasks_with_permissions={tasks_with_permissions}
        triage_next_step_recommendations={triage_next_step_recommendations}
      />
    </div>
  )
}
