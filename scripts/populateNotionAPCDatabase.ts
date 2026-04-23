#!/usr/bin/env -S deno run -A --env

/**
 * Populates the Adult Primary Care Guidelines Notion database.
 *
 * For each unique page number across all three APC table of contents objects,
 * creates a Notion database row with:
 *   - Page title (e.g. "21-burns")
 *   - PDF Page URL
 *   - GitHub links for tasks, priority evaluations, and diagnosis rules lisp files
 *
 * Each Notion page's content includes:
 *   - The full-size PDF thumbnail image
 *   - Task test-result images (with task name captions)
 *   - Lisp code blocks for tasks, priority evaluations, and diagnosis rules
 *
 * Usage:
 *   deno task run:trusted scripts/populateNotionAPCDatabase.ts
 *
 * Requires NOTION_INTEGRATION_SECRET in .env
 */

import { hyphenate } from '../util/hyphenate.ts'
import {
  ADULT_PAC_CHRONIC_CONDITIONS_TABLE_OF_CONTENTS,
  ADULT_PAC_OTHER_TABLE_OF_CONTENTS,
  ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS,
} from '../shared/pack-adult.ts'

// ---- Constants ----

const NOTION_TOKEN = Deno.env.get('NOTION_INTEGRATION_SECRET')
if (!NOTION_TOKEN) throw new Error('NOTION_INTEGRATION_SECRET not set')

const DATABASE_ID = '33653e3f-8c34-8079-8e9f-d33312e8f0fd'
const NOTION_VERSION = '2022-06-28'
const NOTION_VERSION_FILE_UPLOAD = '2026-03-11'
const PDF_BASE = 'https://knowledgehub.health.gov.za/system/files/elibdownloads/2023-10/APC_2023_Clinical_tool-PRINT.pdf'
const GITHUB_BLOB_BASE = 'https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa/blob/main'

const TASKS_DIR = 's_expression/tasks/apc-adult'
const PRIORITY_DIR = 's_expression/system_priority_evaluations/apc-adult'
const DIAGNOSIS_DIR = 's_expression/system_diagnosis_rules/apc-adult'
const THUMBNAILS_DIR = 'static/medical-resources/za/primary-care/adult/thumbnails/full-size'
const TEST_RESULTS_DIR = 'apc-test-results'
const RED_BOXES_DIR = 'red_boxes/apc-adult'

// ---- Notion API helpers ----

function notionHeaders(contentType = 'application/json'): HeadersInit {
  return {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': contentType,
  }
}

async function notionRequest<T>(url: string, init: RequestInit): Promise<T> {
  while (true) {
    const res = await fetch(url, init)
    if (res.status === 429) {
      const retry_after = parseInt(res.headers.get('Retry-After') ?? '5')
      console.log(`  Rate limited, waiting ${retry_after}s...`)
      await new Promise((r) => setTimeout(r, retry_after * 1000))
      continue
    }
    const data = await res.json()
    if (!res.ok) {
      throw new Error(`Notion API error ${url} ${res.status}: ${JSON.stringify(data)}`)
    }
    return data as T
  }
}

// ---- File upload ----

function notionFileUploadHeaders(contentType = 'application/json'): HeadersInit {
  return {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION_FILE_UPLOAD,
    'Content-Type': contentType,
  }
}

async function uploadImage(localPath: string, filename: string): Promise<string> {
  // Step 1: Create upload session
  const created = await notionRequest<{ id: string }>('https://api.notion.com/v1/file_uploads', {
    method: 'POST',
    headers: notionFileUploadHeaders(),
    body: JSON.stringify({ mode: 'single_part', filename, content_type: 'image/png' }),
  })
  const upload_id = created.id

  // Step 2: Send file bytes
  const bytes = await Deno.readFile(localPath)
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: 'image/png' }), filename)
  await notionRequest(`https://api.notion.com/v1/file_uploads/${upload_id}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION_FILE_UPLOAD,
    },
    body: form,
  })

  return upload_id
}

// ---- Block helpers ----

type NotionBlock = Record<string, unknown>

function imageBlock(fileupload_id: string, caption?: string): NotionBlock {
  return {
    type: 'image',
    image: {
      type: 'file_upload',
      file_upload: { id: fileupload_id },
      ...(caption ? { caption: [{ type: 'text', text: { content: caption } }] } : {}),
    },
  }
}

function heading2Block(text: string): NotionBlock {
  return {
    type: 'heading_2',
    heading_2: {
      rich_text: [{ type: 'text', text: { content: text } }],
    },
  }
}

// Notion rich_text content max is 2000 chars; split across multiple paragraph blocks if needed.
function paragraphBlocks(content: string): NotionBlock[] {
  const MAX = 2000
  const blocks: NotionBlock[] = []
  let remaining = content
  while (remaining.length > 0) {
    const chunk = remaining.slice(0, MAX)
    remaining = remaining.slice(MAX)
    blocks.push({
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] },
    })
  }
  return blocks
}

// Notion rich_text content max is 2000 chars; split across multiple segments if needed.
function codeBlock(content: string, language = 'lisp'): NotionBlock {
  const MAX = 2000
  const rich_text = []
  let remaining = content
  while (remaining.length > 0) {
    rich_text.push({ type: 'text', text: { content: remaining.slice(0, MAX) } })
    remaining = remaining.slice(MAX)
  }
  return { type: 'code', code: { language, rich_text } }
}

async function appendBlocks(pageId: string, blocks: NotionBlock[]): Promise<void> {
  // Notion API allows max 100 children per request
  for (let i = 0; i < blocks.length; i += 100) {
    await notionRequest(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: 'PATCH',
      headers: notionHeaders(),
      body: JSON.stringify({ children: blocks.slice(i, i + 100) }),
    })
  }
}

// ---- Red box helpers ----

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

interface RedBoxFile {
  slug: string
  path: string
}

async function readRedBoxFiles(page_number: number): Promise<RedBoxFile[]> {
  const files: RedBoxFile[] = []
  try {
    for await (const entry of Deno.readDir(RED_BOXES_DIR)) {
      if (!entry.isFile || !entry.name.endsWith('.txt')) continue
      const m = entry.name.match(/^(\d+)-(.+)\.txt$/)
      if (m && parseInt(m[1]) === page_number) {
        files.push({ slug: m[2], path: `${RED_BOXES_DIR}/${entry.name}` })
      }
    }
  } catch {
    // directory missing — skip
  }
  files.sort((a, b) => a.slug.localeCompare(b.slug))
  return files
}

// ---- Lisp file discovery ----

async function readLispFilenames(dir: string): Promise<Map<number, string>> {
  const map = new Map<number, string>()
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (!entry.isFile || !entry.name.endsWith('.lisp')) continue
      const m = entry.name.match(/^(\d+)-/)
      if (m) map.set(parseInt(m[1]), entry.name.replace(/\.lisp$/, ''))
    }
  } catch {
    // directory missing — skip
  }
  return map
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path)
    return true
  } catch {
    return false
  }
}

// ---- Page entry construction ----

interface PageEntry {
  page_number: number
  title: string // e.g. "21-burns"
  slug: string // e.g. "burns"
}

async function buildPageEntries(): Promise<PageEntry[]> {
  // Collect unique page numbers (first-seen wins) across all TOCs
  const first_names = new Map<number, string>()
  for (
    const toc of [
      ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS,
      ADULT_PAC_CHRONIC_CONDITIONS_TABLE_OF_CONTENTS,
      ADULT_PAC_OTHER_TABLE_OF_CONTENTS,
    ] as Record<string, number>[]
  ) {
    for (const [name, page] of Object.entries(toc)) {
      if (!first_names.has(page)) first_names.set(page, name)
    }
  }

  // Build a combined page-number → slug map from all lisp directories
  const [taskSlugs, prioritySlugs, diagnosisSlugs] = await Promise.all([
    readLispFilenames(TASKS_DIR),
    readLispFilenames(PRIORITY_DIR),
    readLispFilenames(DIAGNOSIS_DIR),
  ])

  const lisp_slug_for_page = (n: number): string | undefined => {
    const full = taskSlugs.get(n) ?? prioritySlugs.get(n) ?? diagnosisSlugs.get(n)
    return full ? full.replace(/^\d+-/, '') : undefined
  }

  const entries: PageEntry[] = []
  for (const [page, name] of [...first_names.entries()].sort((a, b) => a[0] - b[0])) {
    const slug = lisp_slug_for_page(page) ?? hyphenate(name)
    entries.push({ page_number: page, slug, title: `${page}-${slug}` })
  }
  return entries
}

// ---- Notion database operations ----

async function fetchExistingPages(): Promise<Map<string, string>> {
  const pages = new Map<string, string>()
  let cursor: string | undefined
  do {
    const data = await notionRequest<{
      results: { id: string; properties: { Page: { title: { plain_text: string }[] } } }[]
      next_cursor: string | null
    }>(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: notionHeaders(),
        body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
      },
    )
    for (const page of data.results) {
      const title = page.properties.Page?.title?.[0]?.plain_text
      if (title) pages.set(title, page.id)
    }
    cursor = data.next_cursor ?? undefined
  } while (cursor)
  return pages
}

async function clearPageContent(pageId: string): Promise<void> {
  const block_ids: string[] = []
  let cursor: string | undefined
  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${pageId}/children`)
    url.searchParams.set('page_size', '100')
    if (cursor) url.searchParams.set('start_cursor', cursor)
    const data = await notionRequest<{
      results: { id: string }[]
      next_cursor: string | null
    }>(url.toString(), { method: 'GET', headers: notionHeaders() })
    for (const block of data.results) block_ids.push(block.id)
    cursor = data.next_cursor ?? undefined
  } while (cursor)

  for (const block_id of block_ids) {
    await notionRequest(`https://api.notion.com/v1/blocks/${block_id}`, {
      method: 'DELETE',
      headers: notionHeaders(),
    })
  }
}

async function createPageRow(entry: PageEntry): Promise<string> {
  const task_lisp = `${TASKS_DIR}/${entry.title}.lisp`
  const priority_lisp = `${PRIORITY_DIR}/${entry.title}.lisp`
  const diagnosis_lisp = `${DIAGNOSIS_DIR}/${entry.title}.lisp`

  const [hasTask, hasPriority, hasDiagnosis] = await Promise.all([
    fileExists(task_lisp),
    fileExists(priority_lisp),
    fileExists(diagnosis_lisp),
  ])

  const properties: Record<string, unknown> = {
    'Page': {
      title: [{ type: 'text', text: { content: entry.title } }],
    },
    'PDF Page': {
      url: `${PDF_BASE}#page=${entry.page_number}`,
    },
  }

  if (hasTask) {
    properties['Tasks Definition Link'] = {
      url: `${GITHUB_BLOB_BASE}/${task_lisp}`,
    }
  }
  if (hasPriority) {
    properties['Priority Evaluation Link'] = {
      url: `${GITHUB_BLOB_BASE}/${priority_lisp}`,
    }
  }
  if (hasDiagnosis) {
    properties['Diagnosis Rules Link'] = {
      url: `${GITHUB_BLOB_BASE}/${diagnosis_lisp}`,
    }
  }

  const created = await notionRequest<{ id: string }>('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify({
      parent: { database_id: DATABASE_ID },
      properties,
    }),
  })

  return created.id
}

async function buildAndAppendContent(pageId: string, entry: PageEntry): Promise<void> {
  const blocks: NotionBlock[] = []

  // 1. Full-size thumbnail
  const thumbnail_path = `${THUMBNAILS_DIR}/${entry.page_number}.png`
  if (await fileExists(thumbnail_path)) {
    console.log(`    Uploading thumbnail ${entry.page_number}.png`)
    const upload_id = await uploadImage(thumbnail_path, `${entry.page_number}.png`)
    blocks.push(imageBlock(upload_id))
  }

  // 2. Task test-result images
  const test_result_dir = `${TEST_RESULTS_DIR}/${entry.page_number}`
  if (await fileExists(test_result_dir)) {
    const images: string[] = []
    for await (const dir_entry of Deno.readDir(test_result_dir)) {
      if (dir_entry.isFile && dir_entry.name.endsWith('.png')) images.push(dir_entry.name)
    }
    images.sort()

    if (images.length > 0) {
      blocks.push(heading2Block('Additional Tasks User Interface'))
      for (const img_file of images) {
        const img_path = `${test_result_dir}/${img_file}`
        console.log(`    Uploading task image ${img_file}`)
        const upload_id = await uploadImage(img_path, img_file)
        const caption = img_file.replace(/\.png$/, '')
        blocks.push(imageBlock(upload_id, caption))
      }
    }
  }

  // 3. Red boxes
  const red_box_files = await readRedBoxFiles(entry.page_number)
  for (const rbf of red_box_files) {
    blocks.push(heading2Block(`Red Box: ${slugToTitle(rbf.slug)}`))
    const content = await Deno.readTextFile(rbf.path)
    blocks.push(...paragraphBlocks(content))
  }

  // 4. Tasks lisp
  const task_lisp = `${TASKS_DIR}/${entry.title}.lisp`
  if (await fileExists(task_lisp)) {
    blocks.push(heading2Block('Tasks'))
    blocks.push(codeBlock(await Deno.readTextFile(task_lisp)))
  }

  // 5. Priority evaluations lisp
  const priority_lisp = `${PRIORITY_DIR}/${entry.title}.lisp`
  if (await fileExists(priority_lisp)) {
    blocks.push(heading2Block('Priority Evaluations'))
    blocks.push(codeBlock(await Deno.readTextFile(priority_lisp)))
  }

  // 6. Diagnosis rules lisp
  const diagnosis_lisp = `${DIAGNOSIS_DIR}/${entry.title}.lisp`
  if (await fileExists(diagnosis_lisp)) {
    blocks.push(heading2Block('Diagnosis Rules'))
    blocks.push(codeBlock(await Deno.readTextFile(diagnosis_lisp)))
  }

  if (blocks.length > 0) {
    await appendBlocks(pageId, blocks)
  }
}

// ---- Main ----

async function main() {
  const entries = await buildPageEntries()
  console.log(`Found ${entries.length} unique pages in TOC.`)

  console.log('Fetching existing Notion pages...')
  const existing = await fetchExistingPages()
  console.log(`${existing.size} pages already exist.`)

  const new_count = entries.filter((e) => !existing.has(e.title)).length
  console.log(
    `Creating ${new_count} new pages, replacing content on ${entries.length - new_count} existing pages...`,
  )

  for (const entry of entries) {
    const existing_page_id = existing.get(entry.title)
    if (existing_page_id) {
      console.log(`Replacing content for ${entry.title}...`)
      await clearPageContent(existing_page_id)
      await buildAndAppendContent(existing_page_id, entry)
      console.log(`  ✓ ${entry.title} (${existing_page_id})`)
    } else {
      console.log(`Creating ${entry.title}...`)
      const page_id = await createPageRow(entry)
      await buildAndAppendContent(page_id, entry)
      console.log(`  ✓ ${entry.title} (${page_id})`)
    }
  }

  console.log('\nDone.')
}

if (import.meta.main) {
  main()
}
