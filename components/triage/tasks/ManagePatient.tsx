import { RenderedTaskToBeDone } from '../../../types.ts'
import { uniqueIdentifier } from './uniqueIdentifier.ts'

export function ManagePatientTask({
  task,
}: {
  task: RenderedTaskToBeDone & { atom: 'procedure' }
}) {
  const name = `just_do_it_tasks.${uniqueIdentifier(task)}`

  return (
    <label class='flex gap-4 items-center cursor-pointer p-4 rounded-lg border border-gray-300 bg-white hover:border-gray-400 transition-colors'>
      <div class='flex items-center justify-center px-0 py-0.5 w-5 shrink-0'>
        <div class='flex items-center justify-center rounded'>
          <input
            id={name}
            type='checkbox'
            name={name}
            value='true'
            checked={!!task.existing_record}
            class='w-5 h-5 rounded-md border-gray-400 text-indigo-700 focus:ring-indigo-700'
          />
        </div>
      </div>
      <span class='text-sm text-gray-800'>{task.description}</span>
    </label>
  )
}
