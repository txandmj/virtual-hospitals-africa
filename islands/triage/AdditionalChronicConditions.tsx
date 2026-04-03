import { useSignal } from '@preact/signals'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import AsyncSearch from '../AsyncSearch.tsx'
import generateUUID from '../../util/uuid.ts'

type ConditionRow = {
  uuid: string
}

export function AdditionalChronicConditions() {
  const rows = useSignal<ConditionRow[]>([])

  function addRow() {
    rows.value = [...rows.value, { uuid: generateUUID() }]
  }

  function removeRow(uuid: string) {
    rows.value = rows.value.filter((r) => r.uuid !== uuid)
  }

  return (
    <div class='col-span-4 flex flex-col gap-2 px-3 py-2'>
      {rows.value.map((row) => (
        <RemoveRow key={row.uuid} onClick={() => removeRow(row.uuid)} centered>
          <AsyncSearch
            search_route='/app/snomed/finding-like?chronic=true'
            name={`additional_chronic_conditions.${row.uuid}.specific_snomed_concept`}
            placeholder='Search chronic condition'
            skip_blank_search
            className='w-full max-w-125'
            include_hidden_input_fields={['category']}
          />
        </RemoveRow>
      ))}
      <AddRow text='Add chronic condition' onClick={addRow} />
    </div>
  )
}
