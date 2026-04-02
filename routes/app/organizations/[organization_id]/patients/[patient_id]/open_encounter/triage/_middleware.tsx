import { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import { assertOrRedirect } from '../../../../../../../../util/assertOr.ts'
import { workflowHandler } from '../_middleware.tsx'

export const handler = workflowHandler

export function redirectToRoutePatientIfEmergency(ctx: OpenEncounterWorkflowContext) {
  assertOrRedirect(
    ctx.state.encounter.priority?.name !== 'Emergency',
    `${ctx.state.open_encounter_pathname}/triage/route_patient`,
  )
}
