import { YesNoGrid } from '../../../islands/form/inputs/yes_no.tsx'
import { TaskGroup } from '../../../types.ts'
import cls from '../../../util/cls.ts'
import { CheckForTask } from './CheckFor.tsx'
import { DueTo } from './DueTo.tsx'
import { isFinding } from './type-predicates.ts'
import { uniqueIdentifier } from './uniqueIdentifier.ts'

export function CheckForGroup({
  task_groups,
  page_mixed_completion,
  organization_id,
}: {
  task_groups: TaskGroup[]
  page_mixed_completion: boolean
  organization_id: string
}) {
  const groups_with_check_fors = task_groups
    .map((group) => ({
      ...group,
      check_for_tasks: group.tasks.filter(isFinding),
    }))
    .filter((group) => group.check_for_tasks.length > 0)

  if (!groups_with_check_fors.length) return null

  return (
    <YesNoGrid title='Check for'>
      {groups_with_check_fors.map((group, index) => (
        <>
          <DueTo
            key={index}
            due_to={group.due_to}
            organization_id={organization_id}
            group_completed={group.completed}
            page_mixed_completion={page_mixed_completion}
            className={cls('col-span-4 pl-4', {
              'pt-1': index === 0,
              'pt-5': index > 0,
            })}
          />
          {group.check_for_tasks.map((task) => (
            <CheckForTask
              key={uniqueIdentifier(task)}
              organization_id={organization_id}
              task={task}
            />
          ))}
        </>
      ))}
    </YesNoGrid>
  )
}
