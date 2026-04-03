import { useSignal } from '@preact/signals'
import { AddRow, RemoveRow } from '../AddRemove.tsx'
import AsyncSearch from '../AsyncSearch.tsx'
import generateUUID from '../../util/uuid.ts'
import { HiddenInput } from '../../components/library/HiddenInput.tsx'

type ExistingCondition = {
  id: string
  specific_snomed_concept_id: string
  specific_snomed_concept_name: string
  specific_snomed_concept_category: string
}

type ConditionRow = {
  uuid: string
  existing_value?: { id: string; name: string; category: string }
}

export function AdditionalChronicConditions(
  { existing_conditions = [] }: { existing_conditions?: ExistingCondition[] },
) {
  const rows = useSignal<ConditionRow[]>(
    existing_conditions.map((c) => ({
      uuid: c.id,
      existing_value: {
        id: c.specific_snomed_concept_id,
        name: c.specific_snomed_concept_name,
        category: c.specific_snomed_concept_category,
      },
    })),
  )

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
          {row.existing_value && (
            <HiddenInput
              name={`additional_chronic_conditions.${row.uuid}.existing`}
              value='true'
            />
          )}
          <AsyncSearch
            search_route='/app/snomed/finding-like?chronic=true'
            name={`additional_chronic_conditions.${row.uuid}.specific_snomed_concept`}
            placeholder='Search chronic condition'
            skip_blank_search
            className='w-full max-w-125'
            include_hidden_input_fields={['category']}
            value={row.existing_value}
          />
        </RemoveRow>
      ))}
      <AddRow text='Add chronic condition' onClick={addRow} />
    </div>
  )
}
