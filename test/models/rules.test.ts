import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { evaluateEvidence } from '../../db/models/rules.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describeParallel('db/models/rules.ts', () => {
  itParallel('can evaluate evidence', () => {
    const evaluated = evaluateEvidence({
      'atom': 'active_condition',
      'snomed_concept': { 'atom': 'snomed_concept', 'name': 'Bite - wound', 'category': 'disorder' },
      'possible': true,
    }, [
      {
        'patient_record_id': 'b72525b4-c972-4a86-af4f-c4e66c53bf89',
        's_expression': '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Bite - wound" "disorder"))',
        'always_applies_if_present': true,
        'history': false,
      },
    ])

    assertEquals(evaluated.satisfies, true)
  })
})
