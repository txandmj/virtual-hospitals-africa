import { useSignal } from '@preact/signals'
import { RenderedEmployeeWithPresenceAndSeniority } from '../types.ts'
import ProvidersSelect from './ProvidersSelect.tsx'
import { HiddenInput } from '../components/library/HiddenInput.tsx'

export default function InviteParticipantsList({
  clinic_employees,
  hospital_employees,
}: {
  clinic_employees: RenderedEmployeeWithPresenceAndSeniority[]
  hospital_employees: RenderedEmployeeWithPresenceAndSeniority[]
}) {
  const participant_emails = useSignal<string[]>([])

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>
        Invite Participants to Consultation
      </h1>

      <ProvidersSelect
        providers={[...clinic_employees, ...hospital_employees]}
        onChange={(employees) => {
          participant_emails.value = employees.map((employee) => employee.email!)
        }}
      />
      <HiddenInput
        name='participant_emails'
        value={participant_emails.value}
      />
    </div>
  )
}
