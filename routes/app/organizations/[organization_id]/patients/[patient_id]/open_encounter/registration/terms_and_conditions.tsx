import { completeAndProceedToNextStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'

export const PatientRegistrationTermsAndConditionsSchema = z.object({})

export const handler = postHandler(
  PatientRegistrationTermsAndConditionsSchema,
  (ctx: OpenEncounterWorkflowContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

// deno-lint-ignore require-await
export async function PatientRegistrationTermsAndConditionsPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  return <>TODO</>
}

export default OpenEncounterWorkflowPage(
  PatientRegistrationTermsAndConditionsPage,
)
