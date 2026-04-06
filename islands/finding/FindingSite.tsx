import { useSignal, useSignalEffect } from '@preact/signals'
import { useRef } from 'preact/hooks'
import AsyncSearch from '../AsyncSearch.tsx'
import { SnomedConceptAttribute } from '../../shared/s_expression_schemas.ts'
import { Maybe, RenderedSnomedConcept } from '../../types.ts'

const base_search_route = '/app/snomed/body-structure'

// function SingularFindingSiteSearch({ initial_value, onChange }: {
//   initial_value: RenderedSnomedConcept
//   onChange(body_structures: RenderedSnomedConcept[]): void
// }) {
//   const params = new URLSearchParams({
//     descendant_of_snomed_concept_name: initial_value.name,
//     descendant_of_snomed_concept_category: initial_value.category,
//   })

//   return (
//     <AsyncSearch<RenderedSnomedConcept>
//       search_route={`${base_search_route}?${params}`}
//       value={initial_value}
//       onSelect={(v) => {
//         onChange(v ? [v] : [])
//       }}
//       placeholder='Search for a body structure...'
//       skip_blank_search
//     />
//   )
// }

// function MultiFindingSiteSearch({ initial_value, onChange }: {
//   initial_value: RenderedSnomedConcept[]
//   onChange(body_structures: RenderedSnomedConcept[]): void
// }) {
//   const signal = useSignal<RenderedSnomedConcept[]>(initial_value)
//   const mounted = useRef(false)
//   useSignalEffect(() => {
//     const value = signal.value
//     if (mounted.current) return onChange(value)
//     mounted.current = true
//   })

//   return (
//     <AsyncSearch<RenderedSnomedConcept>
//       multi
//       search_route={base_search_route}
//       signal={signal}
//       placeholder='Search for a body structure...'
//       skip_blank_search
//     />
//   )
// }

export function FindingSite({
  search_within,
  value,
  onChange,
}: {
  search_within: Maybe<SnomedConceptAttribute>
  value: RenderedSnomedConcept[]
  onChange(body_structures: RenderedSnomedConcept[]): void
}) {
  const search_route = search_within
    ? `${base_search_route}?${new URLSearchParams({
      descendant_of_snomed_concept_name: search_within.value.name,
      descendant_of_snomed_concept_category: search_within.value.category,
    })}`
    : base_search_route

  const signal = useSignal<RenderedSnomedConcept[]>(value)
  const mounted = useRef(false)
  useSignalEffect(() => {
    const value = signal.value
    if (mounted.current) return onChange(value)
    mounted.current = true
  })

  return (
    <div className='flex flex-col gap-2'>
      <h3 className='text-sm font-semibold text-gray-900'>Finding Site</h3>
      <AsyncSearch<RenderedSnomedConcept>
        multi
        search_route={search_route}
        signal={signal}
        placeholder='Search for a body structure...'
        skip_blank_search
      />
    </div>
  )
}
