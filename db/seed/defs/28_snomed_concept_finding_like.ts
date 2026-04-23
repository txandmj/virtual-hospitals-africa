import { FINDING_LIKE_CATEGORIES } from '../../models/snomed_concept_finding_like.ts'
import { define } from '../define.ts'

export default define(
  ['snomed_concept_finding_like'],
  async (trx) => {
    await trx
      .insertInto('snomed_concept_finding_like')
      .columns(['id', 'term'])
      .expression(
        trx
          .selectFrom('snomed_description as sd')
          .innerJoin('snomed_inferred_canonical_name_and_category as c', 'c.id', 'sd.concept_id')
          .select(['sd.concept_id as id', 'sd.term'])
          .where('c.category', 'in', FINDING_LIKE_CATEGORIES),
      )
      .execute()
  },
)
