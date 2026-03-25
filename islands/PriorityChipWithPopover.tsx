import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { RecordPanel } from '../components/library/RecordPanel.tsx'
import { RenderedEvaluationRelativeToHealthWorker, RenderedPatientEncounter } from '../types.ts'
import { PRIORITY_COLORS } from '../shared/priorities.ts'
import cls from '../util/cls.ts'

export function PriorityChipWithPopover({
  priority,
  priority_evaluation,
  organization_id,
}: {
  priority: NonNullable<RenderedPatientEncounter['priority']>
  priority_evaluation: RenderedEvaluationRelativeToHealthWorker
  organization_id: string
}) {
  const colors = PRIORITY_COLORS[priority.name]

  return (
    <Popover className='relative'>
      <PopoverButton
        className={cls(
          "font-['Inter:Semi_Bold',sans-serif] font-semibold leading-6 cursor-pointer bg-transparent border-0 p-0 m-0",
          colors.text,
        )}
      >
        {priority.name}
      </PopoverButton>
      <PopoverPanel anchor={{ to: 'bottom start', gap: 8, padding: 8 }} className='panel z-50 transition duration-100 ease-out'>
        <RecordPanel record={priority_evaluation} organization_id={organization_id} />
      </PopoverPanel>
    </Popover>
  )
}
