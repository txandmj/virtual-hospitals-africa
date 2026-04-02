import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'
import { addTestEmployee, addTestEmployeeWithSession, getRequestTimings } from '../_helpers/employees.ts'
import { createTestOrganization } from '../_helpers/organizations.ts'
import { apcTaskNodes, setupTriageForAPCTaskNode } from '../../scripts/seed/createSamplePatientsForEachAPCPage.ts'
import { pMap } from '../../util/inParallel.ts'
import range from '../../util/range.ts'
import { assert } from 'std/assert/assert.ts'
import { printTsv } from '../../util/parseCsv.ts'

function avg(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid]
}
type StepSamples = {
  warning_signs: number[]
  brief_history: number[]
  height_and_weight: number[]
  measure_vitals: number[]
}

type Row = {
  num_patients: number
  page_number: string
  task_description: string
  warning_signs_avg_ms: number
  warning_signs_median_ms: number
  brief_history_avg_ms: number
  brief_history_median_ms: number
  height_and_weight_avg_ms: number
  height_and_weight_median_ms: number
  measure_vitals_avg_ms: number
  measure_vitals_median_ms: number
}

const rows: Row[] = []

async function doLoadTesting(num_patients: number) {
  const clinic = await createTestOrganization(db)

  const shcp = await addTestEmployee(db, {
    role: 'nurse',
    specialty: 'Primary care',
    organization_id: clinic.id,
  })

  for await (const task_def of apcTaskNodes()) {
    const page_number = task_def.page_slug.match(/^\d+/)?.[0] ?? ''

    const task_samples: StepSamples = { warning_signs: [], brief_history: [], height_and_weight: [], measure_vitals: [] }

    await pMap(range(num_patients), async () => {
      const nurse = await addTestEmployeeWithSession(db, {
        role: 'nurse',
        specialty: 'Triage',
        organization_id: clinic.id,
      })
      const result = await setupTriageForAPCTaskNode(task_def, clinic, nurse, shcp)
      if (!result) {
        console.log(`No result for ${task_def.task_node.description}`)
        return
      }

      function postTimeDurationMillis(step: string) {
        const all_timings = getRequestTimings(nurse.session_id)
        const matching_request = all_timings.find(
          (t) => t.method === 'POST' && t.path.includes(`/triage/${step}`),
        )
        assert(matching_request)
        assert(matching_request.path.includes(result!.encounter.patient_id))
        return matching_request.duration_ms
      }

      task_samples.warning_signs.push(postTimeDurationMillis('warning_signs'))
      task_samples.brief_history.push(postTimeDurationMillis('brief_history'))
      task_samples.height_and_weight.push(postTimeDurationMillis('height_and_weight'))
      task_samples.measure_vitals.push(postTimeDurationMillis('measure_vitals'))
    }, { concurrency: num_patients })

    rows.push({
      num_patients,
      page_number,
      task_description: task_def.task_node.description,
      warning_signs_avg_ms: avg(task_samples.warning_signs),
      warning_signs_median_ms: median(task_samples.warning_signs),
      brief_history_avg_ms: avg(task_samples.brief_history),
      brief_history_median_ms: median(task_samples.brief_history),
      height_and_weight_avg_ms: avg(task_samples.height_and_weight),
      height_and_weight_median_ms: median(task_samples.height_and_weight),
      measure_vitals_avg_ms: avg(task_samples.measure_vitals),
      measure_vitals_median_ms: median(task_samples.measure_vitals),
    })
  }
}

describe.skip('load_testing', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => printTsv(rows))

  it('measures triage step request times across APC pages', () => doLoadTesting(10))
  it('measures triage step request times across APC pages', () => doLoadTesting(100))
})
