import { RenderedEmployeeWithPresenceAndSeniority, TaskWithPermissions, TriageNextStepRecommendations } from '../types.ts'
import { assertUnreachable } from '../util/assertUnreachable.ts'
import sortBy from '../util/sortBy.ts'
import { Priority } from './priorities.ts'

export const TRIAGE_ROUTE_PATIENT_NEXT_STEPS = [
  'await_consultation' as const,
  'hand_over' as const,
  'check_with_colleague' as const,
  'stabilize_patient' as const,
]

export type TriageRoutePatientNextStep = typeof TRIAGE_ROUTE_PATIENT_NEXT_STEPS[number]

function isCantDo(task: TaskWithPermissions): task is TaskWithPermissions & { permissions: { type: 'cant_do' } } {
  return task.permissions.type === 'cant_do'
}

function isApprovalNeeded(task: TaskWithPermissions): task is TaskWithPermissions & { permissions: { type: 'approval_needed' } } {
  return task.permissions.type === 'approval_needed'
}

export function triageNextStepRecommendations(
  priority: Priority,
  clinic_employees: RenderedEmployeeWithPresenceAndSeniority[],
  tasks_with_permissions: TaskWithPermissions[],
): TriageNextStepRecommendations {
  const tasks_i_cant_do = tasks_with_permissions.filter(isCantDo)
  const tasks_needing_approval = tasks_with_permissions.filter(isApprovalNeeded)
  const shcp = clinic_employees[0]
  const notify_shcp = shcp ? [shcp] : []

  const employees_with_tasks = clinic_employees.map((employee) => {
    const tasks_they_can_do_that_i_cant = tasks_i_cant_do.filter((task) =>
      task.permissions.employees_who_can_do.on_duty.includes(employee) ||
      task.permissions.employees_who_can_do.off_duty.includes(employee)
    )
    const tasks_they_can_approve_i_cant = tasks_needing_approval.filter((task) =>
      task.permissions.employees_who_can_approve.on_duty.includes(employee) ||
      task.permissions.employees_who_can_approve.off_duty.includes(employee)
    )
    return { employee, tasks_they_can_do_that_i_cant, tasks_they_can_approve_i_cant }
  })

  switch (priority) {
    case 'Non-urgent':
      return { next_step: 'await_consultation', to_be_notified: [], employees_with_tasks, tasks_identified_requiring_staff_not_on_duty_at_this_facility: true }
    case 'Urgent': {
      const next_step = tasks_i_cant_do.length ? 'hand_over' as const : 'check_with_colleague' as const

      const on_duty = employees_with_tasks.filter(
        ({ employee }) => employee.at_work,
      )

      // See if there's a way of getting everything done among those who are on duty.
      // If not, notify the shcp and note there are tasks_identified_requiring_staff_not_on_duty_at_this_facility
      const on_duty_sorted = sortBy(
        on_duty,
        (employee) => -(employee.tasks_they_can_do_that_i_cant.length + employee.tasks_they_can_approve_i_cant.length),
      )

      const to_be_notified: RenderedEmployeeWithPresenceAndSeniority[] = []
      const remaining_tasks_i_cant_do = new Set(tasks_i_cant_do)
      const remaining_tasks_needing_approval = new Set(tasks_needing_approval)
      while (remaining_tasks_i_cant_do.size || remaining_tasks_needing_approval.size) {
        const notify_staff_member = on_duty_sorted.shift()
        if (!notify_staff_member) {
          return { next_step, to_be_notified: notify_shcp, employees_with_tasks, tasks_identified_requiring_staff_not_on_duty_at_this_facility: true }
        }
        let some_task_they_can_help_with = false
        for (const task of notify_staff_member.tasks_they_can_do_that_i_cant) {
          if (remaining_tasks_i_cant_do.has(task)) {
            remaining_tasks_i_cant_do.delete(task)
            some_task_they_can_help_with = true
          }
        }
        for (const task of notify_staff_member.tasks_they_can_approve_i_cant) {
          if (remaining_tasks_needing_approval.has(task)) {
            remaining_tasks_needing_approval.delete(task)
            some_task_they_can_help_with = true
          }
        }
        if (some_task_they_can_help_with) {
          to_be_notified.push(notify_staff_member.employee)
        }
      }
      return { next_step, to_be_notified, employees_with_tasks, tasks_identified_requiring_staff_not_on_duty_at_this_facility: false }
    }

    case 'Very urgent':
    case 'Emergency':
      return {
        next_step: 'stabilize_patient',
        to_be_notified: notify_shcp,
        employees_with_tasks,
        tasks_identified_requiring_staff_not_on_duty_at_this_facility: false,
      }
    case 'Deceased': {
      throw new Error('TODO Deceased')
    }
    default:
      return assertUnreachable(priority)
  }
}
