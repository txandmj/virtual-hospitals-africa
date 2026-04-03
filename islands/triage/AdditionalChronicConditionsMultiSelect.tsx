import { useSignal } from '@preact/signals'
import AsyncSearch from '../AsyncSearch.tsx'
import { Label } from '../../components/library/Label.tsx'
import { MostRecentRecord } from '../MostRecentRecord.tsx'
import { RenderedFindingRelativeToHealthWorker } from '../../types.ts'

export function AdditionalChronicConditionsMultiSelect({
  existing_conditions,
  organization_id,
}: {
  existing_conditions: RenderedFindingRelativeToHealthWorker[]
  organization_id: string
}) {
  const selected = useSignal([])
  const placeholder = existing_conditions.length ? 'No new conditions selected' : 'No conditions selected'

  return (
    <div id='additional-chronic-conditions-multi-select'>
      <Label label='Additional Chronic Conditions'>
        <AsyncSearch
          multi
          skip_blank_search
          search_route='/app/snomed/finding-like?chronic=true'
          placeholder={placeholder}
          signal={selected}
          name='additional_chronic_conditions'
        />
      </Label>
      {existing_conditions.length > 0 && (
        <div class='pl-1 pt-2 flex flex-col gap-2'>
          {existing_conditions.map((condition) => <MostRecentRecord key={condition.id} record={condition} organization_id={organization_id} />)}
        </div>
      )}
    </div>
  )
}
