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
import { TEST_ORGANIZATION_UUIDS } from '../../test/_helpers/organizations.ts'
import {
  asVitalAssessmentFormValues,
  asVitalMeasurementFormValues,
  asWarningSignsAdult,
  DEFAULT_ASSESSMENTS,
  DEFAULT_MEASUREMENTS,
  setupTriage,
} from '../../test/web/patients/open_encounter/triage/_setup.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS, VitalMeasurement, VITALS_ADULT_SNOMED_CONCEPT_NAMES } from '../../shared/vitals.ts'
import { forEach } from '../../util/inParallel.ts'
import generateUUID from '../../util/uuid.ts'
import { MeasurementComparison, QueryableEvidenceNode } from '../../shared/s_expression_schemas.ts'
import entries from '../../util/entries.ts'

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

function vitalFromSnomedConceptName(name: string): VitalMeasurement | null {
  for (const [vital, concept] of entries(VITAL_MEASUREMENTS_SNOMED_CONCEPTS)) {
    if (concept.name === name) return vital
  }
  return null
}

function vitalValueFromComparison(atom: string, threshold: number): number {
  switch (atom) {
    case '>':
    case '>=':
      return threshold + 1
    case '<':
    case '<=':
      return threshold - 1
    default:
      return threshold
  }
}

async function collectDueTo(task_file_path: string): Promise<{
  evidence_s_expressions: string[]
  vital_overrides: Partial<Record<VitalMeasurement, number>>
}> {
  const expressions = await parseLispFile(task_file_path)
  const tasks = expressions.map((expression) => parseWithSchema(expression, task))

  const all_evidence = new Set<string>()
  const vital_overrides: Partial<Record<VitalMeasurement, number>> = {}

  for (const task_node of tasks) {
    for (const evidence of allEvidenceToLookFor(task_node.due_to)) {
      if (!isVitalsBasedEvidence(evidence)) {
        all_evidence.add(inverseSExpression(evidence))
        continue
      }

      const is_comparator = evidence.atom === '>' || evidence.atom === '<' || evidence.atom === '>=' || evidence.atom === '<=' || evidence.atom === '='
      if (is_comparator) {
        const comparison = evidence as MeasurementComparison
        const snomed_name = comparison.measurement.snomed_concept?.name
        if (snomed_name) {
          const vital = vitalFromSnomedConceptName(snomed_name)
          if (vital) {
            const threshold = comparison.value.toNumber()
            vital_overrides[vital] = vitalValueFromComparison(comparison.atom, threshold)
          }
        }
      } else if (evidence.atom === 'active_condition' && (evidence as { snomed_concept?: { name: string } }).snomed_concept?.name === 'Fever') {
        // Fever threshold is 38.5°C, so use 39.0
        vital_overrides['temperature'] = 39.0
      }
    }
  }

  return { evidence_s_expressions: [...all_evidence], vital_overrides }
}

function pageSlugFromFilePath(file_path: string): string {
  const filename = file_path.split('/').pop()!
  return filename.replace('.lisp', '')
}

async function createSamplePatientsForEachAPCPage() {
  const s_expression_directory = await walkDirectory()
  const task_file_paths = exists(s_expression_directory.get('tasks'))
    .filter((path) => path.includes('apc-adult'))

  const clinic = {
    id: TEST_ORGANIZATION_UUIDS.ZA.clinic,
  }
  // await createTestOrganization(db)

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
    const { evidence_s_expressions, vital_overrides } = await collectDueTo(task_file_path)

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
        },
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
      measurements: asVitalMeasurementFormValues({ ...DEFAULT_MEASUREMENTS.adult, ...vital_overrides }),
      assessments: asVitalAssessmentFormValues(DEFAULT_ASSESSMENTS.adult),
    }

    await setupTriage({
      clinic,
      nurse,
      shcp,
      encounter,
      steps: {
        warning_signs,
        brief_history: {
          common_conditions: {
            pregnancy: { existence: 'No' },
            diabetes: { existence: 'No' },
          },
        },
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
  }, { concurrency: 1 })

  console.log('Done! Created sample patients for all APC pages.')
  await db.destroy()
}

if (import.meta.main) {
  await createSamplePatientsForEachAPCPage()
}
