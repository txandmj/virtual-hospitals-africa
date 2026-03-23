import { assertEquals } from 'std/assert/assert_equals.ts'
import { describe, it } from 'std/testing/bdd.ts'
import { formatRecord, toDisplayableRecord } from '../../shared/patient_records.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { check_for } from '../../shared/s_expression_schemas.ts'
import { assertMatches } from '../../util/assertMatches.ts'

describe('shared/patient_records.ts', () => {
  it('can format a node representing an allergy', () => {
    const check_for_fish_allergy = parseWithSchema('(check_for (allergy (snomed_concept "Fish" "substance")))', check_for)
    assertMatches(check_for_fish_allergy, {
      'atom': 'procedure',
      'root_snomed_concept': {
        'atom': 'snomed_concept',
        'name': 'Procedure',
        'category': 'procedure',
      },
      'specific_snomed_concept': {
        'atom': 'snomed_concept',
        'name': 'Evaluation for signs and symptoms of physical health problems',
        'category': 'procedure',
      },
      'qualifiers': [],
      'attributes': [],
      'value': [
        {
          'atom': 'finding',
          'root_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Clinical finding', 'category': 'finding' },
          'specific_snomed_concept': { 'atom': 'snomed_concept', 'name': 'Allergic condition', 'category': 'finding' },
          'value_snomed_concept': null,
          'excluding': [],
          'qualifiers': [],
          'attributes': [
            {
              'atom': 'attribute',
              'specific_snomed_concept': {
                'atom': 'snomed_concept',
                'name': 'Causative agent',
                'category': 'attribute',
              },
              'value': { 'atom': 'snomed_concept', 'name': 'Fish', 'category': 'substance' },
            },
          ],
          'exact': false,
          'history': true,
          'existence': 'Any',
        },
      ],
    })

    // deno-lint-ignore no-explicit-any
    const displayable = toDisplayableRecord((check_for_fish_allergy.value as any)[0])
    const formatted = formatRecord(displayable)
    assertEquals(formatted.displays.full, 'Allergic condition (Fish)')
  })
})
