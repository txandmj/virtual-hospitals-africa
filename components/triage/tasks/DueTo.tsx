import { MostRecentRecord } from '../../../islands/MostRecentRecord.tsx'
import { RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker } from '../../../types.ts'
import cls from '../../../util/cls.ts'
import { hyphenate } from '../../../util/hyphenate.ts'

export function DueTo(
  { due_to, organization_id, className }: {
    due_to: (RenderedFindingRelativeToHealthWorker | RenderedEvaluationRelativeToHealthWorker)[]
    organization_id: string
    className?: string
  },
) {
  return (
    <div class={cls('due-to flex flex-row gap-1 text-sm leading-5', className)} data-due-to={due_to.map((x) => hyphenate(x.displays.full)).join('-')}>
      <span class='font-semibold text-gray-600'>
        {'Due to '}
      </span>

      {due_to.map((record) => (
        <MostRecentRecord
          key={record.id}
          record={record}
          organization_id={organization_id}
        />
      ))}
    </div>
  )
}
