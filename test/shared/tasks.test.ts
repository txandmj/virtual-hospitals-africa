import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS } from '../../shared/pack-adult.ts'
import { ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED } from '../../shared/adult_pac_table_of_contents_to_snomed.ts'

describe('ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS', () => {
  it('every page number is referred to by ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED', () => {
    const all_page_numbers = new Set(Object.values(ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS))
    const covered_page_numbers = new Set(
      Object.keys(ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED)
        .map((key) => ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS[key as keyof typeof ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS])
        .filter((page) => !!page),
    )
    const missing = [...all_page_numbers].filter((page) => !covered_page_numbers.has(page))
    assertEquals(missing, [], `Page numbers not covered by any SNOMED mapping: ${missing.join(', ')}`)
  })
})
