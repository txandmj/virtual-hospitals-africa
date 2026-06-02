import { Signal } from '@preact/signals'
import AsyncSearch from '../AsyncSearch.tsx'
import { RenderedSnomedConcept } from '../../types.ts'

const base_search_route = '/app/snomed/qualifier-value'

export function QualifierSearch({
  signal,
}: {
  signal: Signal<RenderedSnomedConcept[]>
}) {
  return (
    <div className='flex flex-col gap-2'>
      <h3 className='text-sm font-semibold text-gray-900'>Qualifiers</h3>
      <AsyncSearch<RenderedSnomedConcept>
        multi
        search_route={base_search_route}
        signal={signal}
        placeholder='Search for a qualifier...'
        skip_blank_search
      />
    </div>
  )
}
