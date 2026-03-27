import { RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker, RenderedPatientEncounter } from '../../types.ts'
import findMatching from '../../util/findMatching.ts'

type PriorityObject = NonNullable<RenderedPatientEncounter['priority']>

export function buildPriorityRecord(
  priority: PriorityObject,
  patient_findings: RenderedFindingRelativeToHealthWorker[],
  diagnoses: RenderedEvaluationRelativeToHealthWorker[],
  total_scores: Array<Omit<RenderedEvaluationRelativeToHealthWorker, 'provider' | 'score'> & { score: number }>,
): RenderedEvaluationRelativeToHealthWorker {
  const all_records = [...patient_findings, ...diagnoses, ...total_scores]

  const due_to_relations = priority.records
    .flatMap(({ associated_finding_ids }) =>
      associated_finding_ids.map((finding_id) => {
        const r = findMatching(all_records, { id: finding_id })
        return {
          id: r.id,
          created_at: r.created_at,
          patient_encounter_id: r.patient_encounter_id,
          root_snomed_concept_id: r.root_snomed_concept_id,
          root_snomed_concept_name: r.root_snomed_concept_name,
          root_snomed_concept_category: r.root_snomed_concept_category,
          specific_snomed_concept_id: r.specific_snomed_concept_id,
          specific_snomed_concept_name: r.specific_snomed_concept_name,
          specific_snomed_concept_category: r.specific_snomed_concept_category,
          value: null,
          relation_name: 'Due to' as const,
          displays: r.displays,
        }
      })
    )

  const based_on_relations = priority.based_on_system_priority_evaluation_description
    ? [{
      id: 'system-priority-evaluation',
      created_at: new Date(),
      patient_encounter_id: '',
      root_snomed_concept_id: priority.value_snomed_concept_id,
      root_snomed_concept_name: priority.name,
      root_snomed_concept_category: 'finding' as const,
      specific_snomed_concept_id: priority.value_snomed_concept_id,
      specific_snomed_concept_name: priority.name,
      specific_snomed_concept_category: 'finding' as const,
      value: null,
      relation_name: 'Based on' as const,
      displays: {
        finding: 'System evaluation',
        value: priority.based_on_system_priority_evaluation_description,
        full: priority.based_on_system_priority_evaluation_description,
      },
    }]
    : []

  return {
    type: 'evaluation' as const,
    id: priority.records[0].id,
    created_at: priority.created_at,
    patient_encounter_id: '',
    root_snomed_concept_id: priority.value_snomed_concept_id,
    root_snomed_concept_name: priority.name,
    root_snomed_concept_category: 'finding' as const,
    specific_snomed_concept_id: priority.value_snomed_concept_id,
    specific_snomed_concept_name: priority.name,
    specific_snomed_concept_category: 'finding' as const,
    modifiers: [],
    attributes: [],
    evaluations: [],
    destination_relations: [],
    source_relations: [...due_to_relations, ...based_on_relations],
    displays: {
      finding: priority.name,
      value: null,
      full: priority.name,
    },
    value: null,
    priority: null,
    provider: null,
    as_part_of_procedure: null,
    employment_id: null,
  }
}
