import { z } from 'zod'
import { assertOr400, assertOr403 } from '../../../../../../../util/assertOr.ts'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { OpenEncounterContext } from './_middleware.tsx'
import { canPerform, Workflow, WORKFLOW_STEPS } from '../../../../../../../shared/workflow.ts'
import { patient_workflows } from '../../../../../../../db/models/patient_workflows.ts'
import { WORKFLOW_DEPARTMENTS } from '../../../../../../../shared/departments.ts'
import { arrayIsEmpty } from '../../../../../../../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_presence } from '../../../../../../../db/models/patient_presence.ts'
import { WorkflowStatus } from '../../../../../../../types.ts'

const StartWorkflowSchema = z.object({
  workflow: z.enum([
    'registration' as const,
    'triage' as const,
    'consultation' as const,
    'maternity' as const,
    'prescription_refill' as const,
    'doctor_review' as const,
  ]),
})

export async function startWorkflow<T>(
  ctx: OpenEncounterContext<T>,
  workflow: Workflow,
  opts: {
    planning: 'create_anew_every_time' | 'do_not_create_only_start_if_already_planned'
    patient_presence: 'move_into_specificed_workflow' | 'leave_in_current_workflow'
  },
) {
  const { trx, organization_employment, encounter, patient, patient_age_determination, open_encounter_pathname } = ctx.state

  const department_handling_workflow = canPerform(organization_employment, workflow)

  assertOr403(
    department_handling_workflow,
    `You must be employed in the ${WORKFLOW_DEPARTMENTS[workflow].join(' or ')} department to start ${workflow}`,
  )

  const workflow_status = await createOrUseExistingWorkflow()

  assertOr400(workflow_status.status !== 'completed', `${workflow} workflow already completed`)

  await Promise.all([
    startWorkflow(),
    maybePreCompleteTriageHeightAndWeight(),
    maybeMovePatientIntoWorkflow(),
  ])

  return `${open_encounter_pathname}/${workflow}/${stepToRouteTo()}`

  async function createOrUseExistingWorkflow(): Promise<WorkflowStatus> {
    const do_create_workflow = !encounter.workflows[workflow] || opts.planning === 'create_anew_every_time'

    const created_workflow = do_create_workflow && await patient_workflows.insertOne(
      trx,
      {
        workflow,
        patient_encounter_id: ctx.state.patient_encounter_id,
      },
    )
    if (created_workflow) {
      return {
        patient_workflow_id: created_workflow.id,
        workflow,
        status: 'not started' as const,
        steps_completed: [],
        seen_patient_encounter_employee_ids: [],
      }
    }

    assertOr400(encounter.workflows[workflow], `${workflow} workflow not planned`)

    return encounter.workflows[workflow]
  }

  function startWorkflow() {
    const { employment_id } = organization_employment

    const existing_patient_encounter_employee_id = encounter.all_employees_seen.find(
      (employee) => employee.employee_id === employment_id,
    )?.patient_encounter_employee_id || null

    return patient_workflows.start(
      trx,
      {
        encounter,
        employment_id,
        existing_patient_encounter_employee_id,
        patient_workflow_id: workflow_status!.patient_workflow_id,
      },
    )
  }

  // Pre-complete height_and_weight for adult patients with recent measurements
  function maybePreCompleteTriageHeightAndWeight() {
    if (workflow !== 'triage') return
    if (needsHeightAndWeight()) return
    return patient_workflows.completedStep(trx, {
      workflow: 'triage',
      step: 'height_and_weight',
      patient_workflow_id: workflow_status!.patient_workflow_id,
    })

    function needsHeightAndWeight(): boolean {
      if (patient_age_determination !== 'adult') return true
      const { most_recent_height, most_recent_weight } = patient
      if (!most_recent_height || !most_recent_weight) return true
      const one_year_ago = new Date()
      one_year_ago.setFullYear(one_year_ago.getFullYear() - 1)
      const height_taken_within_one_year = new Date(most_recent_height.taken_at) <= one_year_ago
      if (!height_taken_within_one_year) return true
      const weight_taken_within_one_year = new Date(most_recent_height.taken_at) <= one_year_ago
      if (!weight_taken_within_one_year) return true
      return false
    }
  }

  function maybeMovePatientIntoWorkflow() {
    if (opts.patient_presence !== 'move_into_specificed_workflow') return
    return patient_presence.set(
      ctx.state.trx,
      encounter.patient.id,
      {
        current_workflow: workflow,
        department_name: department_handling_workflow,
        next_workflow: null,
      },
    )
  }

  function stepToRouteTo() {
    const first_incomplete_step = WORKFLOW_STEPS[workflow].find((s) => {
      if (arrayIsEmpty(workflow_status!.steps_completed)) return true
      return !workflow_status!.steps_completed.includes(s)
    })

    if (opts.planning === 'do_not_create_only_start_if_already_planned') {
      assert(
        first_incomplete_step,
        'There must be some incomplete step if the workflow is not completed',
      )
    }

    return first_incomplete_step || WORKFLOW_STEPS[workflow][0]
  }
}

export const handler = postHandler(
  StartWorkflowSchema,
  (ctx: OpenEncounterContext, { workflow }) =>
    startWorkflow(
      ctx,
      workflow,
      {
        planning: 'do_not_create_only_start_if_already_planned',
        patient_presence: 'move_into_specificed_workflow',
      },
    ).then(redirect),
)
