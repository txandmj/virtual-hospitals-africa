import { TRIAGE_ROUTE_PATIENT_NEXT_STEPS, TriageRoutePatientNextStep } from '../../shared/triage_route_patient.ts'
import { Names, Priority, RenderedManageTaskToBeDone, RenderedTaskToBeDone, TasksDividedByPermission } from '../../types.ts'
import assertOneOf from '../../util/assertOneOf.ts'
import capitalize from '../../util/capitalize.ts'
import compact from '../../util/compact.ts'
import { ArrowTrendingUpIcon, AtSymbolIcon, ClockIcon } from './icons/heroicons/outline.tsx'
import { ActionsRadioGroupSelect } from './ActionsRadioGroupSelect.tsx'
import { objectPronoun, posessivePronoun, pronoun } from '../../shared/sex_and_gender.ts'
import { preferredName } from '../../util/asNames.ts'

export function NextStepSelect(
  { patient, default_next_step, priority, to_be_notified, tasks_divided_by_permission, onSelect }: {
    patient: {
      names: Names
      gender: string | null
    }
    default_next_step: TriageRoutePatientNextStep
    priority: {
      name: Priority
      target_treatment_time: Date | null
    }
    to_be_notified: string[]
    tasks_divided_by_permission: TasksDividedByPermission
    onSelect(next_step: TriageRoutePatientNextStep): void
  },
) {
  const staff = new Intl.ListFormat('en').format(to_be_notified) || 'staff'

  return (
    <ActionsRadioGroupSelect
      name='next_step'
      defaultValue={default_next_step}
      onInput={(event) => {
        assertOneOf(event.currentTarget.value, TRIAGE_ROUTE_PATIENT_NEXT_STEPS)
        onSelect(event.currentTarget.value)
      }}
      options={compact([
        {
          id: 'await_consultation' satisfies TriageRoutePatientNextStep,
          name: 'Await consultation',
          icon: ClockIcon,
          iconForeground: 'text-green-700',
          iconBackground: 'bg-green-50',
          description: compact([
            `I will show ${patient.names.preferred_name} to the waiting room.`,
            `${capitalize(pronoun(patient))} will be prioritized based on ${posessivePronoun(patient)} ${priority.name.toLowerCase()} case.`,
            priority.target_treatment_time &&
            `Target treatment time: ${new Date(priority.target_treatment_time).toLocaleTimeString('en', { hour: 'numeric', minute: 'numeric' })}`,
          ]),
        },
        tasks_i_can_do_without_approval_needed.length && {
          id: 'manage_and_refer' satisfies TriageRoutePatientNextStep,
          name: 'Manage and refer',
          icon: AtSymbolIcon,
          iconForeground: 'text-yellow-700',
          iconBackground: 'bg-yellow-50',
          description: compact([
            `I will stay here to manage ${patient.names.preferred_name}:`,
            <ul key='manage-tasks' class='mt-1.5 list-disc list-inside space-y-1'>
              {tasks_i_can_do_without_approval_needed.map((task, i) => <li key={i} class='text-xs text-gray-700'>{task.description}</li>)}
            </ul>,
            `${capitalize(staff)} will be notified immediately about ${posessivePronoun(patient)} case and location.${
              tasks_for_another.length ? ' They may approve:' : ''
            }`,
            !!tasks_for_another.length && (
              <ul key='pending-approval-tasks' class='mt-1.5 list-disc list-inside space-y-1'>
                {tasks_for_another.map((task, i) => <li key={i} class='text-xs text-gray-700'>{task.description}</li>)}
              </ul>
            ),
            default_next_step === 'manage_and_refer' && (
              <span key='recommended' className='italic'>
                Recommended based on {objectPronoun(patient)} having a {priority.name.toLowerCase()} case and tasks for you to manage.
              </span>
            ),
          ]),
        },
        !tasks_i_can_do.length && {
          id: 'refer' satisfies TriageRoutePatientNextStep,
          name: 'Refer',
          icon: AtSymbolIcon,
          iconForeground: 'text-yellow-700',
          iconBackground: 'bg-yellow-50',
          description: compact([
            `${capitalize(staff)} will be notified immediately about ${preferredName(patient, 'the patient')}'s case and location.`,
            `I will move on to triage another patient once they have confirmed they are taking over.`,
            default_next_step === 'refer' && (
              <span key='recommended' className='italic'>Recommended based on {objectPronoun(patient)} having a {priority.name.toLowerCase()} case.</span>
            ),
          ]),
        },
        {
          id: 'stabilize_patient' satisfies TriageRoutePatientNextStep,
          name: 'Stabilize patient',
          icon: ArrowTrendingUpIcon,
          iconForeground: 'text-rose-700',
          iconBackground: 'bg-rose-50',
          description: compact([
            `I will transfer ${patient.names.preferred_name} to the stabilization area.`,
            `${capitalize(staff)} will be notified immediately to meet us there.`,
            default_next_step === 'stabilize_patient' && (
              <span key='recommended' className='italic'>Recommended based on {objectPronoun(patient)} having a {priority.name.toLowerCase()} case.</span>
            ),
          ]),
        },
        // {
        //   id: 'confirm' as unknown as TriageRoutePatientNextStep,
        //   name: 'Confirm treatment plan',
        //   icon: AtSymbolIcon,
        //   iconForeground: 'text-sky-700',
        //   iconBackground: 'bg-sky-50',
        //   description: compact([
        //     `I will stay here with ${patient.names.preferred_name}.`,
        //     `${capitalize(staff)} will be notified immediately about ${posessivePronoun(patient)} case to confirm next steps.`,
        //     // default_next_step === 'hand_over' && (
        //     //   <span key='recommended' className='italic'>Recommended based on {objectPronoun(patient)} having a {priority.name.toLowerCase()} case.</span>
        //     // ),
        //   ]),
        // },
        // {
        //   id: 'come_back_later' satisfies TriageRoutePatientNextStep,
        //   name: 'Come back later',
        //   icon: ReceiptRefundIcon,
        //   iconForeground: 'text-yellow-700',
        //   iconBackground: 'bg-yellow-50',
        //   description: compact([
        //     `${capitalize(staff)} will be notified with my message.`,
        //     `${patient.names.preferred_name} will stay here.`,
        //     `I will serve other patients and come back once ${staff} ${to_be_notified.length === 1 ? 'has' : 'have'} responded.`,
        //   ]),
        // },
      ])}
    />
  )
}
