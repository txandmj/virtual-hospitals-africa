import db from '../../db/db.ts'
import { walkDirectory } from '../../s_expression/compile.ts'
import { exists } from '../../util/exists.ts'
import { addTestEmployee } from '../../mocks/testEmployee.ts'
import { addTestEmployeeWithSession } from '../../test/_helpers/employees.ts'
import { route } from '../../test/_route.ts'
import { forEach } from '../../util/inParallel.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import puppeteer from 'npm:puppeteer'
import { pageSlugFromFilePath, setupTriageForAPCPage } from './createSamplePatientsForEachAPCPage.ts'

async function screenshotAPCAdditionalTasks() {
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

  const browser = await puppeteer.launch({
    args: ['--ignore-certificate-errors', '--no-sandbox'],
    headless: true,
  })

  try {
    const { hostname } = new URL(route)

    await forEach(task_file_paths, async (task_file_path) => {
      const page_slug = pageSlugFromFilePath(task_file_path)
      const triage = await setupTriageForAPCPage(task_file_path, clinic, nurse, shcp)
      if (triage == null) return

      const page = await browser.newPage()
      try {
        await page.setViewport({ width: 1280, height: 900 })
        await page.setCookie(
          { name: 'session_id', value: nurse.session_id, domain: hostname },
          { name: 'health_worker_id', value: nurse.health_worker.id, domain: hostname },
        )

        const url = `${route}/app/organizations/${clinic.id}/patients/${triage.patient_id}/open_encounter/triage/additional_tasks_and_investigations`
        await page.goto(url, { waitUntil: 'networkidle0' })

        const output_dir = `./apc-test-results/${page_slug}`
        await Deno.mkdir(output_dir, { recursive: true })
        await page.screenshot({ path: `${output_dir}/additional_tasks.png`, fullPage: true })

        console.log(`Screenshot saved: ${output_dir}/additional_tasks.png`)
      } finally {
        await page.close()
      }
    }, { concurrency: 1 })
  } finally {
    await browser.close()
  }

  console.log('Done! Screenshots saved to ./apc-test-results/')
}

if (import.meta.main) {
  await screenshotAPCAdditionalTasks()
  await db.destroy()
}
