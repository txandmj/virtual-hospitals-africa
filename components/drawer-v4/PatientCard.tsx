import { PRIORITY_COLORS } from '../../shared/priorities.ts'
import { RenderedEvaluationRelativeToHealthWorker, RenderedPatient, RenderedPatientEncounter } from '../../types.ts'
import { PriorityChipWithPopover } from '../../islands/PriorityChipWithPopover.tsx'
import cls from '../../util/cls.ts'

// Patient's drawer card component with avatar, name, DOB, and triage
export function DrawerPatientCard(
  { patient, organization_id, priority, priority_evaluation }: {
    patient: RenderedPatient
    organization_id: string
    priority: RenderedPatientEncounter['priority']
    priority_evaluation: RenderedEvaluationRelativeToHealthWorker | null
  },
) {
  const priority_color = priority ? PRIORITY_COLORS[priority.name] : { bg: 'bg-gray-100', text: 'text-gray-800' }

  const href = patient.completed_registration ? `/app/organizations/${organization_id}/patients/${patient.id}/profile` : undefined
  const Tag = href ? 'a' : 'div'

  return (
    <div
      className={cls(
        'sticky top-0 z-10 box-border flex items-start gap-2 w-full px-3 py-2',
        priority_color.bg,
      )}
    >
      <Tag
        className='flex flex-col justify-between gap-1 relative min-w-0 flex-1'
        href={href}
      >
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] leading-6.5 text-gray-800">
          {patient.name}
        </p>
        <p className='text-xs text-[#29313d]'>
          {patient.description}
        </p>
      </Tag>
      <div id='patient-drawer-priority' className='self-center shrink-0'>
        {priority
          ? (
            <PriorityChipWithPopover
              priority={priority}
              priority_evaluation={priority_evaluation!}
              organization_id={organization_id}
            />
          )
          : (
            <span
              className={cls(
                "font-['Inter:Semi_Bold',sans-serif] font-semibold leading-6",
                'text-gray-800',
              )}
            >
              Undetermined
            </span>
          )}
      </div>
    </div>
  )
}
