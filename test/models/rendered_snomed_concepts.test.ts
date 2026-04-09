import { after, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { rendered_snomed_concepts } from '../../db/models/rendered_snomed_concepts.ts'
import findMatching from '../../util/findMatching.ts'
import { assert } from 'std/assert/assert.ts'

describe('db/models/rendered_snomed_concepts.ts', () => {
  after(() => db.destroy())

  it('can find concepts by category', async () => {
    const administration_methods = await rendered_snomed_concepts.findAll(db, {
      category: 'administration method',
      search: 'gar',
    })

    const gargle = findMatching(administration_methods, { name: 'Gargle' })
    assert(gargle)

    assert(administration_methods.every((snomed_concept) => snomed_concept.name !== 'Gari'))

    const substances = await rendered_snomed_concepts.findAll(db, {
      category: 'substance',
      search: 'gar',
    })

    const gari = findMatching(substances, { name: 'Gari' })
    assert(gari)

    assert(substances.every((snomed_concept) => snomed_concept.name !== 'Gargle'))
  })
})
