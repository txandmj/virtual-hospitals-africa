import { sql } from 'kysely'
import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { SnomedCategory } from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'

type SearchTerms = {
  search: string
  descendant_of_snomed_concept_id?: string
  descendant_of_snomed_concept_name?: string
  descendant_of_snomed_concept_category?: SnomedCategory
}

function baseQuery(trx: TrxOrDbOrQueryCreator, terms: SearchTerms) {
  assertOr400(terms.search, 'Must be searching for a term')

  const best_similarity = sql<number>`max(similarity(term, ${terms.search}))`

  return trx
    .selectFrom('snomed_concept_body_structure')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_concept_body_structure.id',
    )
    .where(sql<boolean>`term % ${terms.search}`)
    .$if(!!terms.descendant_of_snomed_concept_id, (qb) =>
      qb.innerJoin(
        'snomed_concept_active_descendants_realized as ancestor_filter',
        (join) =>
          join
            .onRef('ancestor_filter.descendant_id', '=', 'snomed_concept_body_structure.id')
            .on('ancestor_filter.ancestor_id', '=', terms.descendant_of_snomed_concept_id!),
      ))
    .$if(!!terms.descendant_of_snomed_concept_name, (qb) => {
      assert(terms.descendant_of_snomed_concept_category)
      return qb
        .innerJoin(
          'snomed_inferred_canonical_name_and_category as named_ancestor',
          (join) =>
            join
              .on('named_ancestor.name', '=', terms.descendant_of_snomed_concept_name!)
              .on('named_ancestor.category', '=', terms.descendant_of_snomed_concept_category!),
        )
        .innerJoin(
          'snomed_concept_active_descendants_realized as named_ancestor_filter',
          (join) =>
            join
              .onRef('named_ancestor_filter.descendant_id', '=', 'snomed_concept_body_structure.id')
              .onRef('named_ancestor_filter.ancestor_id', '=', 'named_ancestor.id'),
        )
    })
    .select((eb) => [
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_inferred_canonical_name_and_category.name',
      'snomed_inferred_canonical_name_and_category.category',
      best_similarity.as('best_similarity'),
      jsonArrayFrom(
        eb.selectFrom('snomed_relationship')
          .innerJoin('snomed_concept', 'snomed_concept.id', 'snomed_relationship.source_id')
          .innerJoin(
            'snomed_inferred_canonical_name_and_category as desc_info',
            'desc_info.id',
            'snomed_relationship.source_id',
          )
          .whereRef('snomed_relationship.destination_id', '=', 'snomed_inferred_canonical_name_and_category.id')
          .where('snomed_relationship.active', '=', true)
          .where('snomed_concept.active', '=', true)
          .where('snomed_relationship.type_id', '=', '116680003')
          .select(['desc_info.id', 'desc_info.name', 'desc_info.category']),
      ).as('immediate_descendants'),
      eb.selectFrom('snomed_concept_active_descendants_realized as descendants_count')
        .whereRef('descendants_count.ancestor_id', '=', 'snomed_inferred_canonical_name_and_category.id')
        .whereRef('descendants_count.descendant_id', '!=', 'descendants_count.ancestor_id')
        .select((eb2) => eb2.fn.countAll<number>().as('count'))
        .as('total_descendants'),
    ])
    .groupBy('snomed_inferred_canonical_name_and_category.id')
    .orderBy(best_similarity, 'desc')
}

export const snomed_concept_body_structure = base({
  top_level_table: 'snomed_concept_body_structure',
  baseQuery,
  formatResult: identity,
})
