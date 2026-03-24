import { TaskGroup } from '../../../types.ts'
import { hyphenate } from '../../../util/hyphenate.ts'
import { isManage } from '../../../shared/tasks.ts'
import { ManagePatientTask } from './ManagePatient.tsx'
import { DueTo } from './DueTo.tsx'
import { uniqueIdentifier } from './uniqueIdentifier.ts'

export function ManagePatientGroup({
  group,
  organization_id,
}: {
  group: TaskGroup
  organization_id: string
}) {
  const tasks = group.tasks.filter(isManage)
  if (!tasks.length) return null

  return (
    <div class='task-group-card flex flex-col gap-4' data-due-to={group.due_to.map((x) => hyphenate(x.displays.full)).join('-')}>
      <DueTo
        due_to={group.due_to}
        is_follow_up={false}
        organization_id={organization_id}
      />
      {tasks.map((task) => (
        <ManagePatientTask
          key={uniqueIdentifier(task)}
          task={task}
        />
      ))}
    </div>
  )
}
