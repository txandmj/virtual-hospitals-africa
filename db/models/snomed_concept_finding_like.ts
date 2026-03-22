import { sql } from 'kysely'
import { IdSelectable, TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { SnomedCategory } from '../../db.d.ts'
import { idSelection } from '../helpers.ts'

type SearchTerms = {
  snomed_concept_id?: IdSelectable
  search?: string
}

export const FINDING_LIKE_CATEGORIES: SnomedCategory[] = [
  'finding' as const,
  'morphologic abnormality' as const,
  'disorder' as const,
  'situation' as const,
  'event' as const,
]

function baseQuery(trx: TrxOrDbOrQueryCreator, terms: SearchTerms) {
  const best_similarity = terms.search ? sql<number>`max(similarity(${terms.search}, term))` : sql<number>`0`

  let query = trx
    .selectFrom('snomed_concept_finding_like')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_concept_finding_like.id',
    )
    .leftJoin(
      'snomed_inferred_canonical_name_and_category as preferred_category_of_same_name',
      (join) =>
        FINDING_LIKE_CATEGORIES
          ? join.on((eb) =>
            eb.or(
              FINDING_LIKE_CATEGORIES!.slice(1).flatMap((category, i) => {
                const higher_ranking_categories = FINDING_LIKE_CATEGORIES!.slice(0, i + 1)
                return higher_ranking_categories.map((higher_ranking_category) =>
                  eb.and([
                    eb('preferred_category_of_same_name.name', '=', eb.ref('snomed_inferred_canonical_name_and_category.name')),
                    eb('snomed_inferred_canonical_name_and_category.category', '=', category),
                    eb('preferred_category_of_same_name.category', '=', higher_ranking_category),
                  ])
                )
              }),
            )
          )
          : join.on(sql<boolean>`false`),
    )
    .where('preferred_category_of_same_name.id', 'is', null)
    .select([
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_inferred_canonical_name_and_category.name',
      'snomed_inferred_canonical_name_and_category.category',
      best_similarity.as('best_similarity'),
    ])
    .groupBy('snomed_inferred_canonical_name_and_category.id')

  if (terms.snomed_concept_id) {
    query = query.where(
      'snomed_concept_finding_like.id',
      ...idSelection(terms.snomed_concept_id),
    )
  }

  if (terms.search) {
    query = query
      .where(sql<boolean>`${terms.search} <% term`)
      .orderBy(best_similarity, 'desc')
  }

  return query
}

export const snomed_concept_finding_like = base({
  top_level_table: 'snomed_concept_finding_like',
  baseQuery,
  formatResult: identity,
})
