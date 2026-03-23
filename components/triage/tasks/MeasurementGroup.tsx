import { assert } from 'std/assert/assert.ts'
import { TaskGroup } from '../../../types.ts'
import { hyphenate } from '../../../util/hyphenate.ts'
import negate from '../../../util/negate.ts'
import partition from '../../../util/partition.ts'
import { MeasurementTask } from './Measurement.tsx'
import { isFinding, isLink, isManage, isMeasurement } from './type-predicates.ts'
import { uniqueIdentifier } from './uniqueIdentifier.ts'
import { DueTo } from './DueTo.tsx'

export function MeasurementGroup({
  group,
  page_mixed_completion,
  organization_id,
}: {
  group: TaskGroup
  page_mixed_completion: boolean
  organization_id: string
}) {
  const tasks = group.tasks
    .filter(negate(isLink))
    .filter(negate(isFinding))
    .filter(negate(isManage))
  if (!tasks.length) return null
  const [measure_tasks, none] = partition(tasks, isMeasurement)
  assert(measure_tasks.length)
  assert(none.length === 0)

  return (
    <div class='task-group-card flex flex-col gap-4' data-due-to={group.due_to.map((x) => hyphenate(x.displays.full)).join('-')}>
      <DueTo 
        due_to={group.due_to}
        group_completed={group.completed}
        page_mixed_completion={page_mixed_completion}
        organization_id={organization_id} 
      />

      {measure_tasks.map((task) => (
        <MeasurementTask
          key={uniqueIdentifier(task)}
          organization_id={organization_id}
          task={task}
        />
      ))}
    </div>
  )
}
