import { assert } from 'std/assert/assert.ts'
import db from '../../db/db.ts'
import { snomed_concept_finding_like } from '../../db/models/snomed_concept_finding_like.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'

describeParallel('db/models/snomed_concept_finding_like.ts', () => {
  afterAll(() => db.destroy())

  itParallel('does not find findings with finding context -> known absent', async () => {
    const { results } = await snomed_concept_finding_like.search(db, {
      search: 'earache',
    })

    for (const result of results) {
      assert(result.name !== 'No earache')
    }
  })
})
