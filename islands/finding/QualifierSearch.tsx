import { useSignal, useSignalEffect } from '@preact/signals'
import { useRef } from 'preact/hooks'
import AsyncSearch from '../AsyncSearch.tsx'
import { RenderedSnomedConcept } from '../../types.ts'

const base_search_route = '/app/snomed/qualifier-value'

export function QualifierSearch({
  value,
  onChange,
}: {
  value: RenderedSnomedConcept[]
  onChange(qualifiers: RenderedSnomedConcept[]): void
}) {
  const signal = useSignal<RenderedSnomedConcept[]>(value)
  const mounted = useRef(false)
  useSignalEffect(() => {
    const next = signal.value
    if (mounted.current) return onChange(next)
    mounted.current = true
  })

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
