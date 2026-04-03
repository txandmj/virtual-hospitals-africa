import { useSignal } from '@preact/signals'
import AsyncSearch from '../AsyncSearch.tsx'
import { Label } from '../../components/library/Label.tsx'
import { MostRecentRecord } from '../MostRecentRecord.tsx'
import { RenderedFindingRelativeToHealthWorker } from '../../types.ts'

export function AllergiesMultiSelect({
  existing_allergies,
  organization_id,
}: {
  existing_allergies: RenderedFindingRelativeToHealthWorker[]
  organization_id: string
}) {
  const selected = useSignal([])
  const placeholder = existing_allergies.length ? 'No new allergies selected' : 'No allergies selected'

  return (
    <div id='allergies-multi-select'>
      <Label label='Allergies'>
        <AsyncSearch
          multi
          skip_blank_search
          search_route='/app/snomed/allergies'
          placeholder={placeholder}
          signal={selected}
          name='allergies'
        />
      </Label>
      {existing_allergies.length > 0 && (
        <div class='pl-1 pt-2 flex flex-col gap-2'>
          {existing_allergies.map((allergy) => <MostRecentRecord key={allergy.id} record={allergy} organization_id={organization_id} />)}
        </div>
      )}
    </div>
  )
}
