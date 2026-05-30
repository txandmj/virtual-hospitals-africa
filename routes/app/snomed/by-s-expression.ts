import { parseWithSchema } from '../../../shared/s_expression.ts'
import { finding_base, insertable_finding_base, Lang } from '../../../shared/s_expression_schemas.ts'
import { nameAndCategorySnomedConceptBase } from '../../../db/models/s_expression.ts'
import { jsonBuildObject, literalString } from '../../../db/helpers.ts'
import { json } from '../../../util/responses.ts'
import { LoggedInHealthWorkerContext } from '../../../types.ts'
import { ATTRIBUTE, IS_A } from '../../../shared/snomed_concepts.ts'
import { assertOr400 } from '../../../util/assertOr.ts'

export const handler = {
  async GET(ctx: LoggedInHealthWorkerContext) {
    assertOr400(ctx.req.headers.get('accept') === 'application/json')

    const s_expression = ctx.url.searchParams.get('s_expression')
    assertOr400(s_expression, 'Missing s_expression parameter')

    const node = parseWithSchema(s_expression, insertable_finding_base)

    const predefined_attributes: Lang['attribute'][] = await ctx.state.trx
      .selectFrom('snomed_relationship')
      .innerJoin(
        'snomed_inferred_canonical_name_and_category as rel_type',
        'rel_type.id',
        'snomed_relationship.type_id',
      )
      .innerJoin(
        'snomed_inferred_canonical_name_and_category as rel_dest',
        'rel_dest.id',
        'snomed_relationship.destination_id',
      )
      .where(
        'snomed_relationship.source_id',
        'in',
        nameAndCategorySnomedConceptBase(ctx.state.trx, node.specific_snomed_concept),
      )
      .where('snomed_relationship.active', '=', true)
      .where('snomed_relationship.type_id', '!=', IS_A.id)
      .select((eb) => [
        literalString('attribute' as const).as('atom'),
        jsonBuildObject({
          atom: literalString('snomed_concept' as const),
          name: literalString(ATTRIBUTE.name),
          category: literalString(ATTRIBUTE.category),
        }).as('root_snomed_concept'),
        jsonBuildObject({
          atom: literalString('snomed_concept' as const),
          name: eb.ref('rel_type.name').$notNull(),
          category: eb.ref('rel_type.category').$notNull(),
        }).as('specific_snomed_concept'),
        jsonBuildObject({
          atom: literalString('snomed_concept' as const),
          name: eb.ref('rel_dest.name').$notNull(),
          category: eb.ref('rel_dest.category').$notNull(),
        }).as('value'),
      ])
      .orderBy('rel_type.name')
      .execute()

    const relevant_qualifier_s_expressions = await ctx.state.trx
      .selectFrom('due_to_findings')
      .innerJoin('due_to', 'due_to.id', 'due_to_findings.id')
      .innerJoin('snomed_concept_active_descendants_realized', 'ancestor_id', 'due_to_findings.specific_snomed_concept_id')
      .where('due_to_findings.is_somehow_qualified', '=', true)
      .where('due_to_findings.value_snomed_concept_id', 'is', null)
      .where(
        'snomed_concept_active_descendants_realized.descendant_id',
        'in',
        nameAndCategorySnomedConceptBase(ctx.state.trx, node.specific_snomed_concept),
      )
      .select('due_to.s_expression')
      .execute()

    const relevant_qualifiers = relevant_qualifier_s_expressions.flatMap(({ s_expression }) => parseWithSchema(s_expression, finding_base).qualifiers)

    return json({ ...node, predefined_attributes, relevant_qualifiers })
  },
}
