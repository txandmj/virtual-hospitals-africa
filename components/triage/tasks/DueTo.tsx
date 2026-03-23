import { MostRecentRecord } from '../../../islands/MostRecentRecord.tsx'
import { RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker } from '../../../types.ts'
import cls from '../../../util/cls.ts'
import { hyphenate } from '../../../util/hyphenate.ts'

export function DueTo(
  { due_to, organization_id, is_follow_up, className }: {
    due_to: (RenderedFindingRelativeToHealthWorker | RenderedEvaluationRelativeToHealthWorker)[]
    organization_id: string
    is_follow_up?: boolean
    className?: string
  },
) {
  return (
    <div class={cls('flex flex-col', className)}>
      {is_follow_up && (
        <span class='inline-flex py-0.5 text-xs font-medium text-indigo-800'>
          * Follow up based on new findings
        </span>
      )}
      <div
        class={cls('due-to flex flex-row flex-wrap items-center gap-x-1 gap-y-1 text-sm leading-5')}
        data-due-to={due_to.map((x) => hyphenate(x.displays.full)).join('-')}
      >
        <span class='font-semibold text-gray-600'>
          {'Due to '}
        </span>

        {due_to.map((record) => (
          <MostRecentRecord
            key={record.id}
            record={record}
            organization_id={organization_id}
          />
        ))}
      </div>
    </div>
  )
}
