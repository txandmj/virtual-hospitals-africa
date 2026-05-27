import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../db/db.ts'
import { addTestEmployeeWithSession } from 'test/_helpers/employees.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { assertMatches } from '../../../util/assertMatches.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describeParallel('/app/snomed/by-s-expression', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel(
    'returns the parsed finding plus its predefined attributes, including Finding site: Respiratory tract structure for Cough',
    async () => {
      const { fetchJSON } = await addTestEmployeeWithSession(db, {
        role: 'nurse',
      })

      const s_expression = '(clinical_finding (snomed_concept "Cough" "finding"))'
      const result = await fetchJSON(
        `/app/snomed/by-s-expression?s_expression=${encodeURIComponent(s_expression)}`,
      )

      assertMatches(result, {
        atom: 'finding',
        root_snomed_concept: {
          atom: 'snomed_concept',
          name: 'Clinical finding',
          category: 'finding',
        },
        specific_snomed_concept: {
          atom: 'snomed_concept',
          name: 'Cough',
          category: 'finding',
        },
        value_snomed_concept: null,
        qualifiers: [],
        attributes: [],
        excluding: [],
        exact: false,
        history: false,
        existence: 'Yes',
      })

      assertEquals(result.predefined_attributes, [
        {
          atom: 'attribute',
          root_snomed_concept: {
            atom: 'snomed_concept',
            name: 'Attribute',
            category: 'attribute',
          },
          specific_snomed_concept: {
            atom: 'snomed_concept',
            name: 'Finding site',
            category: 'attribute',
          },
          value: {
            atom: 'snomed_concept',
            name: 'Respiratory tract structure',
            category: 'body structure',
          },
        },
        {
          atom: 'attribute',
          root_snomed_concept: {
            atom: 'snomed_concept',
            name: 'Attribute',
            category: 'attribute',
          },
          specific_snomed_concept: {
            atom: 'snomed_concept',
            name: 'Interprets',
            category: 'attribute',
          },
          value: {
            atom: 'snomed_concept',
            name: 'Respiratory function',
            category: 'observable entity',
          },
        },
      ])
    },
  )
})
