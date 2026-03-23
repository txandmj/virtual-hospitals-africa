export const TRIAGE_ROUTE_PATIENT_NEXT_STEPS = [
  'await_consultation' as const,
  'manage_and_refer' as const,
  'refer' as const,
  'stabilize_patient' as const,
]

export type TriageRoutePatientNextStep = typeof TRIAGE_ROUTE_PATIENT_NEXT_STEPS[number]
