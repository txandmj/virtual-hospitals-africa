import { YesNoQuestion } from '../../../islands/form/inputs/yes_no.tsx'
import { MostRecentRecord } from '../../../islands/MostRecentRecord.tsx'
import { RenderedTaskToBeDone } from '../../../types.ts'
import { HiddenInput } from '../../library/HiddenInput.tsx'
import { uniqueIdentifier } from './uniqueIdentifier.ts'

export function CheckForTask({
  organization_id,
  task,
}: {
  organization_id: string
  task: RenderedTaskToBeDone & { atom: 'finding' }
}) {
  const name = `check_for.${uniqueIdentifier(task)}`

  return (
    <>
      <HiddenInput
        name={`${name}.s_expression`}
        value={task.s_expression}
      />
      <HiddenInput
        name={`${name}.existing_record.id`}
        value={task.existing_record?.id}
      />
      <HiddenInput
        name={`${name}.existing_record.existence`}
        value={task.existing_record?.existence}
      />
      <YesNoQuestion
        name={`${name}.existence`}
        value={task.existing_record?.existence}
        label={task.displays.full}
        required
        most_recent_finding={
          <MostRecentRecord
            record={task.existing_record}
            organization_id={organization_id}
          />
        }
      />
    </>
  )
}
