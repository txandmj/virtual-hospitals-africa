import { HealthWorkerOrganization, TaskGroup } from '../../../types.ts'
import { hyphenate } from '../../../util/hyphenate.ts'
import { isManage } from '../../../shared/tasks.ts'
import { ManagePatientTask } from './ManagePatient.tsx'
import { DueTo } from './DueTo.tsx'
import { uniqueIdentifier } from './uniqueIdentifier.ts'
import partition from '../../../util/partition.ts'

const referral_complete_task = {
  atom: 'procedure' as const,
  root_snomed_concept: null,
  specific_snomed_concept: null,
  value: null,
  qualifiers: [],
  attributes: [],
  description: 'Referral complete',
  displays: { finding: 'Referral complete', value: null, full: 'Referral complete' },
  s_expression: '',
  existing_record: null,
}

export function ManagePatientGroup({
  group,
  organization_employment,
  organization_id,
}: {
  group: TaskGroup
  organization_employment: HealthWorkerOrganization
  organization_id: string
}) {
  const tasks = group.tasks.filter(isManage)
  if (!tasks.length) return null

  const [tasks_i_can_do, _tasks_for_another] = partition(tasks, (task) => {
    const { permissions } = task
    if (!permissions?.length) return true
    return permissions.some((p) =>
      p.role === (organization_employment.role as 'doctor' | 'nurse' | 'specialist') &&
        !p.specialty || (organization_employment.active_licences.some((licence) => licence.specialty === p.specialty))
    )
  })

  return (
    <div class='task-group-card flex flex-col gap-4' data-due-to={group.due_to.map((x) => hyphenate(x.displays.full)).join('-')}>
      <DueTo
        due_to={group.due_to}
        is_follow_up={false}
        organization_id={organization_id}
      />
      {tasks_i_can_do.map((task) => (
        <ManagePatientTask
          key={uniqueIdentifier(task)}
          task={task}
        />
      ))}
      <ManagePatientTask
        key='confirm_handoff'
        task={referral_complete_task}
      />
    </div>
  )
}
