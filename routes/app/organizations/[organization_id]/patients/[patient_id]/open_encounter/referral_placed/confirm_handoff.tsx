import { z } from 'zod'
import { success } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeLastStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { preferredName } from '../../../../../../../../util/asNames.ts'
import { additional_tasks } from '../../../../../../../../db/models/additional_tasks.ts'
import { isManage } from '../../../../../../../../shared/tasks.ts'
import { ManagePatientGroup } from '../../../../../../../../components/triage/tasks/ManagePatientGroup.tsx'
import SectionHeader from '../../../../../../../../components/library/typography/SectionHeader.tsx'
import { NoTasks } from '../../../../../../../../components/triage/tasks/NoTasks.tsx'
import { patient_primary_care } from '../../../../../../../../db/models/patient_primary_care.ts'
import { employees } from '../../../../../../../../db/models/employees.ts'
import { employeeDisplay } from '../../../../../../../../util/healthWorkerDisplay.ts'
import { Person } from '../../../../../../../../components/library/Person.tsx'
import Badge from '../../../../../../../../components/library/Badge.tsx'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

const ReferralPlacedConfirmHandoffSchema = z.object({})

export const handler = postHandler(
  ReferralPlacedConfirmHandoffSchema,
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    const { organization_pathname, patient } = ctx.state
    await completeLastStep(ctx)

    return redirect(
      success(
        `Handoff confirmed for ${preferredName(patient.names!, 'patient')}.`,
        `${organization_pathname}/waiting_room`,
      ),
    )
  },
)

async function ReferralPlacedConfirmHandoffPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, health_worker_id, encounter, organization_employment, organization_id, patient_id } = ctx.state

  const { task_groups, facility } = await promiseProps({
    task_groups: additional_tasks.getTasksGroups(trx, { health_worker_id, encounter }).then((r) => r.task_groups),
    facility: patient_primary_care.getNearestHealthFacility(trx, { patient_id }),
  })

  const primary_care_nurses = facility
    ? (await employees.findAll(trx, { organization_id: facility.id, can_perform_workflow: 'consultation' })).filter((e) => e.role === 'nurse')
    : []

  const groups_with_manage_tasks = task_groups.filter((group) => group.tasks.some(isManage))

  return (
    <div class='flex flex-col gap-6'>
      {primary_care_nurses.length > 0 && (
        <div class='flex flex-col gap-3 pb-4 pt-2 w-full max-w-3xl'>
          <SectionHeader>Primary care nurse</SectionHeader>
          {primary_care_nurses.map((nurse) => (
            <div key={nurse.id} class='flex items-center gap-3'>
              <Person person={employeeDisplay(nurse)} />
              <Badge content='Awaiting handoff' color='yellow' />
            </div>
          ))}
        </div>
      )}
      {groups_with_manage_tasks.length > 0
        ? (
          <div class='flex flex-col gap-3 pb-4 pt-2 w-full max-w-3xl'>
            <SectionHeader>Patient Management Tasks</SectionHeader>
            {groups_with_manage_tasks.map((group, index) => (
              <ManagePatientGroup
                key={index}
                group={group}
                organization_employment={organization_employment}
                organization_id={organization_id}
              />
            ))}
          </div>
        )
        : <NoTasks />}
    </div>
  )
}

export default OpenEncounterWorkflowPage(ReferralPlacedConfirmHandoffPage)
