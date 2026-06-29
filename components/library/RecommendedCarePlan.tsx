import { ComponentChildren } from 'preact'
import { RenderedEmployeeWithPresenceAndSeniority, TaskWithPermissions, TriageNextStepRecommendations } from '../../types.ts'
import { initials } from '../../util/initials.ts'
import cls from '../../util/cls.ts'
import Avatar from './Avatar.tsx'

// A tiny avatar for an employee who can do/approve a task. On-duty employees are
// shown at full opacity; off-duty ones are greyed out. Employees that are slated
// to be notified are wrapped in an indigo ring.
function EmployeeAvatar(
  { employee, to_be_notified }: {
    employee: RenderedEmployeeWithPresenceAndSeniority
    to_be_notified: boolean
  },
) {
  return (
    <Avatar
      size='sm'
      src={employee.avatar_url}
      initials={initials(employee.name)}
      className={cls(
        'text-xs ring-2',
        employee.at_work ? 'opacity-100' : 'opacity-50',
        to_be_notified ? 'ring-indigo-500' : 'ring-white',
      )}
    />
  )
}

// "requires approval from"/"can be done by" followed by the tiny avatars of the
// employees who can satisfy the task's permission, on-duty first.
function PermissionEmployees(
  { label, on_duty, off_duty, to_be_notified_ids }: {
    label: string
    on_duty: RenderedEmployeeWithPresenceAndSeniority[]
    off_duty: RenderedEmployeeWithPresenceAndSeniority[]
    to_be_notified_ids: Set<string>
  },
) {
  return (
    <div class='flex items-center gap-2 flex-none'>
      <span class='text-xs text-gray-500 whitespace-nowrap'>{label}</span>
      <div class='flex -space-x-1 overflow-hidden items-center'>
        {[...on_duty, ...off_duty].map((employee) => (
          <EmployeeAvatar
            key={employee.id}
            employee={employee}
            to_be_notified={to_be_notified_ids.has(employee.id)}
          />
        ))}
      </div>
    </div>
  )
}

function TaskRow({ children }: { children: ComponentChildren }) {
  return <li class='flex items-center justify-between gap-3 text-sm text-gray-700'>{children}</li>
}

export default function RecommendedCarePlan(
  { to_be_notified, tasks_with_permissions }: {
    to_be_notified: RenderedEmployeeWithPresenceAndSeniority[]
    clinic_employees: RenderedEmployeeWithPresenceAndSeniority[]
    tasks_with_permissions: TaskWithPermissions[]
    triage_next_step_recommendations: TriageNextStepRecommendations
  },
) {
  // tasks_with_permissions[0].task

  const to_be_notified_ids = new Set(to_be_notified.map((employee) => employee.id))

  // Tasks not needing permission first, those needing approval next, and those
  // outside the scope of practice (cant_do) last.
  const no_approval_needed = tasks_with_permissions.filter((task) => task.permissions.type === 'no_approval_needed')
  const approval_needed = tasks_with_permissions.filter((task) => task.permissions.type === 'approval_needed')
  const cant_do = tasks_with_permissions.filter((task) => task.permissions.type === 'cant_do')

  return (
    <ul class='w-full flex flex-col gap-2'>
      {no_approval_needed.map(({ task }, i) => (
        <TaskRow key={`no-approval-${i}`}>
          <span>{task.description}</span>
        </TaskRow>
      ))}
      {approval_needed.map(({ task, permissions }, i) =>
        permissions.type === 'approval_needed' && (
          <TaskRow key={`approval-${i}`}>
            <span>{task.description}</span>
            <PermissionEmployees
              label='requires approval from'
              on_duty={permissions.employees_who_can_approve.on_duty}
              off_duty={permissions.employees_who_can_approve.off_duty}
              to_be_notified_ids={to_be_notified_ids}
            />
          </TaskRow>
        )
      )}
      {cant_do.map(({ task, permissions }, i) =>
        permissions.type === 'cant_do' && (
          <TaskRow key={`cant-do-${i}`}>
            <span>{task.description}</span>
            <PermissionEmployees
              label='can be done by'
              on_duty={permissions.employees_who_can_do.on_duty}
              off_duty={permissions.employees_who_can_do.off_duty}
              to_be_notified_ids={to_be_notified_ids}
            />
          </TaskRow>
        )
      )}
    </ul>
  )
}
