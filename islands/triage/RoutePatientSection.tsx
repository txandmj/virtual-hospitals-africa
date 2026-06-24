import { Maybe, Names, Priority, RenderedEmployeeWithPresenceAndSeniority, TasksDividedByPermission } from '../../types.ts'
import { EncounterReason } from '../../db.d.ts'
import { TextArea } from '../../islands/form/inputs/textarea.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import FormSection from '../../components/library/FormSection.tsx'

import { computed, useSignal } from '@preact/signals'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'
import { assertUnreachable } from '../../util/assertUnreachable.ts'
import { TriageRoutePatientNextStep } from '../../shared/triage_route_patient.ts'
import { NextStepSelect } from '../../components/library/NextStepSelect.tsx'
import ProvidersSelect from '../ProvidersSelect.tsx'

function defaultNextStep(priority: Priority, has_manage_patient_tasks: boolean): TriageRoutePatientNextStep {
  switch (priority) {
    case 'Non-urgent':
      return 'await_consultation'
    case 'Urgent':
    case 'Deceased':
      return has_manage_patient_tasks ? 'manage_and_refer' : 'refer'
    case 'Very urgent':
    case 'Emergency':
      return 'stabilize_patient'
    default:
      return assertUnreachable(priority)
  }
}

function getSHCP(clinic_employees: RenderedEmployeeWithPresenceAndSeniority[]) {
  return clinic_employees[0]
}

function defaultToBeNotified(
  next_step: TriageRoutePatientNextStep,
  clinic_employees: RenderedEmployeeWithPresenceAndSeniority[],
): RenderedEmployeeWithPresenceAndSeniority[] {
  switch (next_step) {
    case 'await_consultation':
      return []
    case 'refer':
    case 'manage_and_refer':
    case 'stabilize_patient': {
      const shcp = getSHCP(clinic_employees)
      return shcp ? [shcp] : []
    }
    default: {
      return assertUnreachable(next_step)
    }
  }
}

export default function TriageRoutePatientSection(
  { this_visit, patient, priority, clinic_employees, tasks_divided_by_permission }: {
    this_visit: {
      reason: Maybe<EncounterReason>
      notes?: Maybe<string>
    }
    patient: {
      names: Names
      gender: string | null
    }
    priority: {
      name: Priority
      target_treatment_time: Date | null
    }
    clinic_employees: RenderedEmployeeWithPresenceAndSeniority[]
    tasks_divided_by_permission: TasksDividedByPermission
  },
) {
  const default_next_step = defaultNextStep(priority.name, !!tasks_i_can_do_without_approval_needed.length)
  const next_step = useSignal<string>(default_next_step)
  const to_be_notified = useSignal<RenderedEmployeeWithPresenceAndSeniority[]>(defaultToBeNotified(default_next_step, clinic_employees))
  const to_be_notified_display = computed(() => [...to_be_notified.value].map(employeeDisplay).map((e) => e.display_name))

  return (
    <div class='flex flex-col gap-6'>
      <FormSection id='route_patient_next_step' header='Next Step' always_column>
        <FormRow>
          <NextStepSelect
            patient={patient}
            priority={priority}
            default_next_step={default_next_step}
            to_be_notified={to_be_notified_display.value}
            tasks_divided_by_permission={tasks_divided_by_permission}
            onSelect={(step) => next_step.value = step}
          />
        </FormRow>
      </FormSection>
      <FormSection header='Staff' always_column>
        <FormRow>
          <ProvidersSelect
            providers={clinic_employees}
            initial_selected={to_be_notified.value}
            onChange={(employees) => to_be_notified.value = employees}
          />
        </FormRow>
      </FormSection>
      <FormSection header='Notes' always_column>
        <FormRow>
          <TextArea
            name='notes'
            label={null}
            value={this_visit.notes}
          />
        </FormRow>
      </FormSection>
      <HiddenInput
        name='health_worker_ids_to_be_notified'
        value={[...to_be_notified.value].map((x) => x.id)}
      />
    </div>
  )
}
