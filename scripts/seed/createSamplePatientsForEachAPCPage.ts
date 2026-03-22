import db from '../../db/db.ts'
import { parseLispFile, walkDirectory } from '../../s_expression/compile.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { task } from '../../shared/s_expression_schemas.ts'
import { allEvidenceToLookFor } from '../../db/models/s_expression_evidence.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { exists } from '../../util/exists.ts'
import { addTestEmployee } from '../../mocks/testEmployee.ts'
import { addTestEmployeeWithSession } from '../../test/_helpers/employees.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from '../../test/_helpers/workflows.ts'
import { createTestOrganization } from '../../test/_helpers/organizations.ts'
import {
  asVitalAssessmentFormValues,
  asVitalMeasurementFormValues,
  asWarningSignsAdult,
  DEFAULT_ASSESSMENTS,
  DEFAULT_MEASUREMENTS,
  setupTriage,
} from '../../test/web/patients/open_encounter/triage/_setup.ts'
import { VITALS_ADULT_SNOMED_CONCEPT_NAMES } from '../../shared/vitals.ts'
import { forEach } from '../../util/inParallel.ts'
import generateUUID from '../../util/uuid.ts'
import { MeasurementComparison, QueryableEvidenceNode } from '../../shared/s_expression_schemas.ts'

type Evidence = ReturnType<typeof allEvidenceToLookFor> extends Generator<infer T> ? T : never

function isVitalsBasedEvidence(evidence: Evidence | QueryableEvidenceNode): boolean {
  const finding: { atom: string; snomed_concept?: { name: string } } = (
      evidence.atom === '>' ||
      evidence.atom === '<' ||
      evidence.atom === '>=' ||
      evidence.atom === '<=' ||
      evidence.atom === '='
    )
    ? (evidence as MeasurementComparison).measurement
    : evidence as { atom: string; snomed_concept?: { name: string } }

  return (
    finding.atom === 'measurement' &&
    finding.snomed_concept != null &&
    VITALS_ADULT_SNOMED_CONCEPT_NAMES.has(finding.snomed_concept.name)
  ) || (
    finding.atom === 'active_condition' &&
    finding.snomed_concept?.name === 'Fever'
  )
}

async function collectEvidenceForPage(task_file_path: string): Promise<string[]> {
  const expressions = await parseLispFile(task_file_path)
  const tasks = expressions.map((expression) => parseWithSchema(expression, task))

  const all_evidence = new Set<string>()

  for (const task_node of tasks) {
    // Due to evidence (flattened leaf nodes)
    for (const evidence of allEvidenceToLookFor(task_node.due_to)) {
      if (!isVitalsBasedEvidence(evidence)) {
        all_evidence.add(inverseSExpression(evidence))
      }
    }

    // Checking for evidence (leaf nodes from each check_for item)
    if (Array.isArray(task_node.procedure.value)) {
      for (const item of task_node.procedure.value) {
        try {
          for (const evidence of allEvidenceToLookFor(item)) {
            if (!isVitalsBasedEvidence(evidence)) {
              all_evidence.add(inverseSExpression(evidence))
            }
          }
        } catch {
          // Skip unsupported node types (e.g., time-based comparisons)
        }
      }
    }
  }

  return [...all_evidence]
}

function pageSlugFromFilePath(file_path: string): string {
  const filename = file_path.split('/').pop()!
  return filename.replace('.lisp', '')
}

async function createSamplePatientsForEachAPCPage() {
  const s_expression_directory = await walkDirectory()
  const task_file_paths = exists(s_expression_directory.get('tasks'))
    .filter((path) => path.includes('apc-adult'))

  const clinic = await createTestOrganization(db)

  const [nurse, shcp] = await Promise.all([
    addTestEmployeeWithSession(db, {
      role: 'nurse',
      specialty: 'Triage',
      organization_id: clinic.id,
    }),
    addTestEmployee(db, {
      role: 'nurse',
      specialty: 'Primary care',
      organization_id: clinic.id,
    }),
  ])

  await forEach(task_file_paths.slice(0, 5), async (task_file_path) => {
    const page_slug = pageSlugFromFilePath(task_file_path)
    const evidence_s_expressions = await collectEvidenceForPage(task_file_path)

    const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
      db,
      clinic.id,
      {
        employment_id: nurse.health_worker.employee_id,
        is_tutorial: true,
        patient_demographics: {
          first_names: 'TESTING',
          surname: page_slug,
          name: `TESTING ${page_slug}`,
          preferred_name: 'TESTING',
          date_of_birth: '1990-01-01',
        }
      },
    )

    const additional_findings: Record<string, { s_expression: string; existence: 'Yes'; priority_level: 'Non-urgent' }> = {}
    for (const s_expression of evidence_s_expressions) {
      additional_findings[generateUUID()] = {
        s_expression,
        existence: 'Yes',
        priority_level: 'Non-urgent',
      }
    }

    const warning_signs = {
      warning_signs: {
        ...asWarningSignsAdult([], { pregnant: false }).warning_signs,
        ...additional_findings,
      },
    }

    const measure_vitals = {
      measurements: asVitalMeasurementFormValues(DEFAULT_MEASUREMENTS.adult),
      assessments: asVitalAssessmentFormValues(DEFAULT_ASSESSMENTS.adult),
    }

    await setupTriage({
      clinic,
      nurse,
      shcp,
      encounter,
      steps: {
        warning_signs,
        height_and_weight: {
          measurements: {
            height: { value: 160, units: 'cm' },
            weight: { value: 70, units: 'kg' },
          },
        },
        measure_vitals,
      },
    })

    console.log(`Created patient for page: ${page_slug}`)
  })

  console.log('Done! Created sample patients for all APC pages.')
  await db.destroy()
}

if (import.meta.main) {
  await createSamplePatientsForEachAPCPage()
}
