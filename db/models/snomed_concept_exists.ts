import { SnomedConcept } from '../../shared/s_expression_schemas.ts'
import db from '../db.ts'

export async function conceptDoesNotExist({ concept }: { concept: SnomedConcept }): Promise<boolean> {
  const found = await db.selectFrom('snomed_inferred_canonical_name_and_category')
    .where('name', '=', concept.name)
    .where('category', '=', concept.category)
    .limit(1)
    .executeTakeFirst()

  return !found
}
