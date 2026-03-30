import db from '../../db/db.ts'
import { walkDirectory } from '../../s_expression/compile.ts'
import { exists } from '../../util/exists.ts'
import { addTestEmployee, TestEmployee } from '../../mocks/testEmployee.ts'
import { addTestEmployeeWithSession, TestEmployeeWithSession } from '../../test/_helpers/employees.ts'
import { route } from '../../test/_route.ts'
import { forEach } from '../../util/inParallel.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import puppeteer from 'puppeteer'
import { pageSlugFromFilePath, tasksToX } from './createSamplePatientsForEachAPCPage.ts'
import { hyphenate } from '../../util/hyphenate.ts'
import { assert } from 'std/assert/assert.ts'
import { WarningSignPriority } from '../../db.d.ts'
import { snomedConceptBase } from '../../db/models/s_expression.ts'
import { snomed_warning_signs } from '../../db/models/snomed_warning_signs.ts'
import { COMMON_CONDITIONS, CommonConditionKey } from '../../shared/brief_history.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { any_query_single, Lang } from '../../shared/s_expression_schemas.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import {
  asVitalAssessmentFormValues,
  asVitalMeasurementFormValues,
  asWarningSignsAdult,
  DEFAULT_ASSESSMENTS,
  DEFAULT_MEASUREMENTS,
  setupTriage,
} from '../../test/web/patients/open_encounter/triage/_setup.ts'
import fromEntries from '../../util/fromEntries.ts'
import generateUUID from '../../util/uuid.ts'
import { VitalMeasurement } from '../../shared/vitals.ts'
import { delay } from '../../util/delay.ts'
import { exists as fileExists } from '@std/fs/exists'

async function* foo() {
  const s_expression_directory = await walkDirectory()
  const task_file_paths = exists(s_expression_directory.get('tasks'))
    .filter((path) => path.includes('apc-adult'))
  for await (const task_file_path of task_file_paths) {
    yield* tasksToX(task_file_path)
  }
}

async function setupTestCaseForTask(
  { clinic, nurse, shcp, task_node, task_file_path, evidence_s_expressions, vital_overrides, common_condition_keys }: {
    clinic: { id: string }
    nurse: TestEmployeeWithSession
    shcp: TestEmployee
    task_node: Lang['task']
    task_file_path: string
    evidence_s_expressions: string[]
    vital_overrides: Partial<Record<VitalMeasurement, number>>
    common_condition_keys: Set<CommonConditionKey>
  },
) {
  const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
    db,
    clinic.id,
    {
      employment_id: nurse.health_worker.employee_id,
      is_tutorial: true,
      patient_demographics: {
        first_names: 'TESTING',
        surname: task_node.description,
        name: `TESTING ${task_node.description}`,
        preferred_name: 'TESTING',
        date_of_birth: '1990-01-01',
      },
    },
  )

  const brief_history = {
    common_conditions: fromEntries(COMMON_CONDITIONS.map((condition) => [condition.key, {
      existence: common_condition_keys.has(condition.key) ? 'Yes' as const : 'No' as const,
    }])),
  }

  type AdditionalFinding = { s_expression: string; existence: 'Yes'; priority_level?: WarningSignPriority }
  const additional_findings: Record<string, AdditionalFinding> = {}
  for (const s_expression of evidence_s_expressions) {
    const node = parseWithSchema(s_expression, any_query_single)
    const additional_finding: AdditionalFinding = {
      s_expression,
      existence: 'Yes' as const,
      priority_level: undefined,
    }
    const snomed_concept = 'snomed_concept' in node ? node.snomed_concept : (
      assert('specific_snomed_concept' in node && node.specific_snomed_concept), node.specific_snomed_concept
    )
    const as_searched_for_warning_sign = await snomed_warning_signs.findOne(db, {
      snomed_concept_id: snomedConceptBase(db, snomed_concept),
      age_determination: 'adult',
    })
    additional_finding.priority_level = as_searched_for_warning_sign.priority ?? undefined
    additional_findings[generateUUID()] = additional_finding
  }

  const warning_signs = {
    warning_signs: {
      ...asWarningSignsAdult([], { pregnant: brief_history.common_conditions.pregnancy.existence === 'Yes' }).warning_signs,
      ...additional_findings,
    },
  }

  const measure_vitals = {
    measurements: asVitalMeasurementFormValues({ ...DEFAULT_MEASUREMENTS.adult, ...vital_overrides }),
    assessments: asVitalAssessmentFormValues(DEFAULT_ASSESSMENTS.adult),
  }

  const result = await setupTriage({
    clinic,
    nurse,
    shcp,
    encounter,
    steps: {
      brief_history,
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

  console.log(`Created patient for page: ${task_node.description}`)
  return { ...result, task_node, task_file_path }
}

async function screenshotAPCAdditionalTasks() {
  const clinic = await createTestOrganization(db)

  const shcp = await addTestEmployee(db, {
    role: 'nurse',
    specialty: 'Primary care',
    organization_id: clinic.id,
  })

  const { hostname } = new URL(route)

  await forEach(foo(), async ({ task_node, task_file_path, skip, common_condition_keys, evidence_s_expressions, vital_overrides }) => {
    if (skip) return
    const page_slug = pageSlugFromFilePath(task_file_path)
    const output_dir = `./apc-test-results/${page_slug}`
    const file_name = hyphenate(task_node.description)
    const image_filepath = `${output_dir}/${file_name}.png`

    if (await fileExists(image_filepath)) {
      console.log(`${image_filepath} already exists`)
      return
    }
    const nurse = await addTestEmployeeWithSession(db, {
      role: 'nurse',
      specialty: 'Triage',
      organization_id: clinic.id,
    })
    const triage = await setupTestCaseForTask({
      clinic,
      nurse,
      shcp,
      task_node,
      task_file_path,
      evidence_s_expressions,
      vital_overrides,
      common_condition_keys,
    })

    const worked = await doAttempt()
      .catch(() => doAttempt())
      .catch(() => doAttempt())

    if (!worked) {
      throw new Error(`Exceeded max attempts ${task_node.description}`)
    } else {
      console.log(worked)
    }

    async function doAttempt() {
      let page, browser
      try {
        browser = await puppeteer.launch({
          args: ['--ignore-certificate-errors', '--no-sandbox'],
          headless: true,
        })
        await delay(800)
        page = await browser.newPage()
        await delay(800)

        await page.setViewport({ width: 1280, height: 2700 })
        await delay(300)

        await Deno.mkdir(output_dir, { recursive: true })

        await page.setCookie(
          { name: 'session_id', value: nurse.session_id, domain: hostname },
          { name: 'health_worker_id', value: nurse.health_worker.id, domain: hostname },
        )
        await delay(150)

        const url = `${route}/app/organizations/${clinic.id}/patients/${triage.patient_id}/open_encounter/triage/additional_tasks_and_investigations`
        await page.goto(url, { waitUntil: 'networkidle2' })

        await page.screenshot({ path: image_filepath, fullPage: true })
        return `Screenshot saved: ${image_filepath}`
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        if (page) {
          await page.close().catch(() => {})
        }
        if (browser) {
          browser.close().catch(() => {})
        }
      }
    }
  }, { concurrency: 3 })

  console.log('Done! Screenshots saved to ./apc-test-results/')
}

if (import.meta.main) {
  await screenshotAPCAdditionalTasks()
  await db.destroy()
}
