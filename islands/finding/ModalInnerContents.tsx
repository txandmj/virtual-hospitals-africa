import { useSignal } from '@preact/signals'
import { BySExpressionResult, Maybe, NonEmptyArray, RenderedSnomedConcept } from '../../types.ts'
import { FindingSite } from './FindingSite.tsx'
import { groupBy } from '../../util/groupBy.ts'
import { ATTRIBUTE, FINDING_SITE } from '../../shared/snomed_concepts.ts'
import { AugmentedSign } from '../WarningSigns/shared.ts'
import { Lang, SnomedConceptAttribute } from '../../shared/s_expression_schemas.ts'
import { assert } from 'std/assert/assert.ts'
import { findingToDisplayableRecord, formatRecord } from '../../shared/patient_records.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'


function allAttributes(snomed_data: BySExpressionResult) {
  return groupBy([
    ...snomed_data.attributes,
    ...snomed_data.predefined_attributes,
  ], (attr) => attr.specific_snomed_concept.name)
}

function isSnomedConceptAttribute(attr: Lang['attribute']): attr is SnomedConceptAttribute {
  return attr.value.atom === 'snomed_concept'
}

function getPredefinedFindingSite(attributes_map: Map<string, NonEmptyArray<Lang['attribute']>>): Maybe<SnomedConceptAttribute> {
  const finding_site = attributes_map.get(FINDING_SITE.name)?.[0]
  if (!finding_site) return
  assert(isSnomedConceptAttribute(finding_site))
  return finding_site
}

export function FindingModalInnerContents({
  original_node,
  augmented_node,
  onChange,
}: {
  original_node: BySExpressionResult
  augmented_node: Maybe<BySExpressionResult>
  onChange(augmented: Maybe<AugmentedSign>): void
}) {
  const all_original_attributes = allAttributes(original_node)
  const search_within_finding_site = getPredefinedFindingSite(all_original_attributes)
  const all_augmented_attributes = augmented_node ? allAttributes(augmented_node) : new Map<string, NonEmptyArray<Lang['attribute']>>()

  // const onset = useSignal<{ start_date: string; end_date: string | null } | null>(null)
  let initial_finding_sites = all_augmented_attributes.get(FINDING_SITE.name) || []
  if (!initial_finding_sites.length && search_within_finding_site) {
    initial_finding_sites=[search_within_finding_site]
  }
  console.log({original_node, all_original_attributes, initial_finding_sites, search_within_finding_site})
  const finding_sites = useSignal<RenderedSnomedConcept[]>(initial_finding_sites.map(s => {
    assert(s.value.atom === 'snomed_concept')
    return { id: '@@triggersearch', ...s.value }
  }))

  console.log('xxxx', finding_sites.value)

  function runOnChange() {
    console.log('runOnChange')
    /* We have the original_node & original attributes
    // Focusing just on finding site for now, if we
      1. selected finding sites where there were none previously, form a new augmented node with those as attributes
      1. selected finding sites but it's the same as the original node
        a. if predefined, omit
        b. if not predefined include
      2. no finding sites, ignore
    */

    const new_node = structuredClone(original_node)

    const new_finding_sites = finding_sites.value.filter(finding_site => {
      assert(finding_site.category === 'body structure')
      const identical_finding_site_already_existed = (all_original_attributes.get(FINDING_SITE.name) || []).some((attribute) => {
        assert(attribute.value.atom === 'snomed_concept')
        return attribute.value.name === finding_site.name
      })
      return !identical_finding_site_already_existed
    })

    console.log({ new_finding_sites })

    if (!new_finding_sites.length) {
      return onChange(null)
    }

    for (const site of new_finding_sites) {
      new_node.attributes.push({
        atom: 'attribute' as const,
        root_snomed_concept: {
          atom: 'snomed_concept' as const,
          name: ATTRIBUTE.name,
          category: ATTRIBUTE.category,
        },
        specific_snomed_concept: {
          atom: 'snomed_concept' as const,
          name: FINDING_SITE.name,
          category: FINDING_SITE.category,
        },
        value: {
          atom: 'snomed_concept' as const,
          name: site.name,
          category: site.category,
        },
      })
    }

    const s_expression = inverseSExpression(new_node)
    const full_display = formatRecord(findingToDisplayableRecord(new_node)).displays.full
    console.log({new_node, s_expression, full_display})
    onChange({
      s_expression,
      full_display,
    })
    
  }

  return (
    <>
      <div className='overflow-y-auto flex-1 px-6 pb-4 flex flex-col gap-5'>
        {/* <OnsetRow
          today={new Date().toISOString().slice(0, 10)}
          onChange={(value) => {
            onset.value = value
            runOnChange()
          }}
        /> */}
        <FindingSite
          search_within={search_within_finding_site}
          value={finding_sites.value}
          // value={null}
          onChange={(value) => {
            console.log('lewklwlkwekle', value)
            finding_sites.value = value
            runOnChange()
          }}
        />
      </div>
    </>
  )
}
