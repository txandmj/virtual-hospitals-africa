import { sql } from 'kysely'
import { define } from '../define.ts'

export default define(
  ['snomed_concept_qualifier_value'],
  async (trx) => {
    await sql`
      INSERT INTO snomed_concept_qualifier_value (id, term)
      SELECT sd.concept_id as id, sd.term
      FROM snomed_description sd
      JOIN snomed_inferred_canonical_name_and_category c ON c.id = sd.concept_id
      WHERE c.category = ('qualifier value')
    `.execute(trx)
  },
)
