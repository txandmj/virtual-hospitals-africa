import { parseWithSchema } from '../../../shared/s_expression.ts'
import { insertable_finding_base } from '../../../shared/s_expression_schemas.ts'
import { json } from '../../../util/responses.ts'
import { FindingRelatedModifiers, LoggedInHealthWorkerContext } from '../../../types.ts'
import { assertOr400 } from '../../../util/assertOr.ts'
import { snomed_predefined_attributes } from '../../../db/models/snomed_predefined_attributes.ts'
import { snomed_relevant_qualifiers } from '../../../db/models/snomed_relevant_qualifiers.ts'
import { promiseProps } from '../../../util/promiseProps.ts'

export const handler = {
  async GET({ req, url, state: { trx } }: LoggedInHealthWorkerContext) {
    assertOr400(req.headers.get('accept') === 'application/json')

    const s_expression = url.searchParams.get('s_expression')
    assertOr400(s_expression, 'Missing s_expression parameter')

    const node = parseWithSchema(s_expression, insertable_finding_base)

    const finding_related_modifiers: FindingRelatedModifiers = await promiseProps({
      predefined_attributes: snomed_predefined_attributes.findAll(trx, { snomed_concept: node.specific_snomed_concept }),
      relevant_qualifiers: snomed_relevant_qualifiers.distinct(trx, { snomed_concept: node.specific_snomed_concept }),
    })

    return json({ ...node, ...finding_related_modifiers })
  },
}
