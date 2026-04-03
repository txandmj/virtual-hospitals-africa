import { snomed_concept_finding_like } from '../../../db/models/snomed_concept_finding_like.ts'
import { jsonSearchHandler } from '../../../util/jsonSearchHandler.ts'

export const handler = jsonSearchHandler(snomed_concept_finding_like)
