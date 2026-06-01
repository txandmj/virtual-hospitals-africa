import { snomed_concept_qualifier_value } from '../../../db/models/snomed_concept_qualifier_value.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(snomed_concept_qualifier_value)
