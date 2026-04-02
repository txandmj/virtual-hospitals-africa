import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'
import { addTestEmployee, addTestEmployeeWithSession, getRequestTimings } from '../_helpers/employees.ts'
import { createTestOrganization } from '../_helpers/organizations.ts'
import { walkDirectory } from '../../s_expression/compile.ts'
import { exists } from '../../util/exists.ts'
import { pageSlugFromFilePath, setupTriageForAPCPage } from '../../scripts/seed/createSamplePatientsForEachAPCPage.ts'

function avg(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid]
}

describe('load_testing', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  it('measures triage step request times across APC pages', async () => {
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

    type StepSamples = {
      warning_signs: number[]
      brief_history: number[]
      height_and_weight: number[]
      measure_vitals: number[]
    }

    type Row = {
      num_patients: number
      page_number: string
      page_name: string
      task_definition: string
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
    let timing_index = 0

    for (const num_patients of [10, 100]) {
      for (const task_file_path of task_file_paths) {
        const page_slug = pageSlugFromFilePath(task_file_path)
        const page_number = page_slug.match(/^\d+/)?.[0] ?? ''

        const task_samples = new Map<string, StepSamples>()

        for (let i = 0; i < num_patients; i++) {
          for await (const { task_node } of setupTriageForAPCPage(task_file_path, clinic, nurse, shcp)) {
            const all_timings = getRequestTimings(nurse.session_id)
            const patient_timings = all_timings.slice(timing_index)
            timing_index = all_timings.length

            const findPostTime = (step: string): number => {
              return patient_timings.find(
                (t) => t.method === 'POST' && t.path.includes(`/triage/${step}`),
              )?.duration_ms ?? 0
            }

            const key = task_node.description
            if (!task_samples.has(key)) {
              task_samples.set(key, { warning_signs: [], brief_history: [], height_and_weight: [], measure_vitals: [] })
            }
            const samples = task_samples.get(key)!
            samples.warning_signs.push(findPostTime('warning_signs'))
            samples.brief_history.push(findPostTime('brief_history'))
            samples.height_and_weight.push(findPostTime('height_and_weight'))
            samples.measure_vitals.push(findPostTime('measure_vitals'))
          }
        }

        for (const [task_definition, samples] of task_samples) {
          rows.push({
            num_patients,
            page_number,
            page_name: page_slug,
            task_definition,
            warning_signs_avg_ms: avg(samples.warning_signs),
            warning_signs_median_ms: median(samples.warning_signs),
            brief_history_avg_ms: avg(samples.brief_history),
            brief_history_median_ms: median(samples.brief_history),
            height_and_weight_avg_ms: avg(samples.height_and_weight),
            height_and_weight_median_ms: median(samples.height_and_weight),
            measure_vitals_avg_ms: avg(samples.measure_vitals),
            measure_vitals_median_ms: median(samples.measure_vitals),
          })
        }
      }
    }

    const headers: (keyof Row)[] = [
      'num_patients',
      'page_number',
      'page_name',
      'task_definition',
      'warning_signs_avg_ms',
      'warning_signs_median_ms',
      'brief_history_avg_ms',
      'brief_history_median_ms',
      'height_and_weight_avg_ms',
      'height_and_weight_median_ms',
      'measure_vitals_avg_ms',
      'measure_vitals_median_ms',
    ]

    const lines = [
      headers.join('\t'),
      ...rows.map((row) => headers.map((h) => row[h]).join('\t')),
    ]

    console.log(lines.join('\n'))
  })
})
