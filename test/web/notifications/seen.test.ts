import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../../db/db.ts'
import { notifications } from '../../../db/models/notifications.ts'
import { addTestEmployeeWithSession } from 'test/_helpers/employees.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { route } from '../../_route.ts'

const SEEN_URL = '/app/notifications/seen'

async function setupWorker() {
  const organization = await createTestOrganization(db)
  return addTestEmployeeWithSession(db, { role: 'nurse', organization_id: organization.id })
}

function insertTestNotification(health_worker_id: string, row_id: string) {
  return notifications.insert(db, {
    health_worker_id,
    title: 'Test notification',
    description: 'Test description',
    avatar_url: '/images/test.svg',
    table_name: 'patient_encounters',
    row_id,
    notification_type: 'test',
    action_title: 'View',
    action_href: '/app',
  })
}

function postSeen(
  fetchWithSession: (input: string, init?: RequestInit) => ReturnType<typeof fetch>,
  body: unknown,
  { expectedTestError }: { expectedTestError?: boolean } = {},
) {
  return fetchWithSession(
    expectedTestError ? `${SEEN_URL}?expectedTestError=1` : SEEN_URL,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

async function seenAt(notification_id: string) {
  const row = await db
    .selectFrom('health_worker_web_notifications')
    .select('seen_at')
    .where('id', '=', notification_id)
    .executeTakeFirstOrThrow()
  return row.seen_at
}

describeParallel(SEEN_URL, () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  itParallel("marks the authenticated worker's own unread notification", async () => {
    const { fetchJSON, health_worker } = await setupWorker()
    const first = await insertTestNotification(health_worker.id, '00000000-0000-1000-8000-000000000071')
    await insertTestNotification(health_worker.id, '00000000-0000-1000-8000-000000000072')

    const result = await fetchJSON(SEEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notification_ids: [first.id] }),
    })

    assertEquals(result.ok, true)
    assertEquals(result.marked_count, 1)
    assertEquals(result.unread_count, 1)
    assert((await seenAt(first.id)) !== null)
  })

  itParallel('does not inflate marked_count when duplicate ids are sent', async () => {
    const { fetchJSON, health_worker } = await setupWorker()
    const notification = await insertTestNotification(health_worker.id, '00000000-0000-1000-8000-000000000073')

    const result = await fetchJSON(SEEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notification_ids: [notification.id, notification.id] }),
    })

    assertEquals(result.marked_count, 1)
    assertEquals(result.unread_count, 0)
  })

  itParallel("does not mark another worker's notification and reveals nothing about it", async () => {
    const owner = await setupWorker()
    const other = await setupWorker()
    const foreign = await insertTestNotification(other.health_worker.id, '00000000-0000-1000-8000-000000000074')

    const result = await owner.fetchJSON(SEEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notification_ids: [foreign.id] }),
    })

    assertEquals(result.ok, true)
    assertEquals(result.marked_count, 0)
    assertEquals(await seenAt(foreign.id), null)
  })

  itParallel('does not overwrite an already-seen notification', async () => {
    const { fetchJSON, health_worker } = await setupWorker()
    const notification = await insertTestNotification(health_worker.id, '00000000-0000-1000-8000-000000000075')
    const already_seen_at = new Date('2020-01-01T00:00:00Z')
    await db
      .updateTable('health_worker_web_notifications')
      .set({ seen_at: already_seen_at })
      .where('id', '=', notification.id)
      .execute()

    const result = await fetchJSON(SEEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notification_ids: [notification.id] }),
    })

    assertEquals(result.marked_count, 0)
    assertEquals(await seenAt(notification.id), already_seen_at)
  })

  itParallel('counts only owned unread rows when ids are mixed', async () => {
    const owner = await setupWorker()
    const other = await setupWorker()

    const owned_unread = await insertTestNotification(owner.health_worker.id, '00000000-0000-1000-8000-000000000076')
    const owned_seen = await insertTestNotification(owner.health_worker.id, '00000000-0000-1000-8000-000000000077')
    const foreign = await insertTestNotification(other.health_worker.id, '00000000-0000-1000-8000-000000000078')
    const nonexistent = '00000000-0000-1000-8000-0000000000ff'
    await db
      .updateTable('health_worker_web_notifications')
      .set({ seen_at: new Date() })
      .where('id', '=', owned_seen.id)
      .execute()

    const result = await owner.fetchJSON(SEEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        notification_ids: [owned_unread.id, owned_seen.id, foreign.id, nonexistent],
      }),
    })

    assertEquals(result.marked_count, 1)
    assertEquals(await seenAt(foreign.id), null)
  })

  itParallel('returns the recalculated highest_priority after marking', async () => {
    const { fetchJSON, health_worker } = await setupWorker()
    const notification = await insertTestNotification(health_worker.id, '00000000-0000-1000-8000-000000000079')

    const result = await fetchJSON(SEEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notification_ids: [notification.id] }),
    })

    assertEquals(result.unread_count, 0)
    assertEquals(result.highest_priority, null)
  })

  itParallel('rejects an invalid uuid', async () => {
    const { fetch: fetchWithSession } = await setupWorker()
    const response = await postSeen(fetchWithSession, { notification_ids: ['not-a-uuid'] }, {
      expectedTestError: true,
    })
    assertEquals(response.status, 400)
    await response.body?.cancel()
  })

  itParallel('rejects an empty notification_ids array', async () => {
    const { fetch: fetchWithSession } = await setupWorker()
    const response = await postSeen(fetchWithSession, { notification_ids: [] }, {
      expectedTestError: true,
    })
    assertEquals(response.status, 400)
    await response.body?.cancel()
  })

  itParallel('rejects a missing notification_ids field', async () => {
    const { fetch: fetchWithSession } = await setupWorker()
    const response = await postSeen(fetchWithSession, {}, { expectedTestError: true })
    assertEquals(response.status, 400)
    await response.body?.cancel()
  })

  itParallel('rejects unknown fields', async () => {
    const { fetch: fetchWithSession } = await setupWorker()
    const response = await postSeen(fetchWithSession, {
      notification_ids: ['00000000-0000-1000-8000-0000000000aa'],
      extra: true,
    }, { expectedTestError: true })
    assertEquals(response.status, 400)
    await response.body?.cancel()
  })

  itParallel('redirects an unauthenticated request', async () => {
    const response = await fetch(`${route}${SEEN_URL}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ notification_ids: ['00000000-0000-1000-8000-0000000000aa'] }),
      redirect: 'manual',
    })
    assertEquals(response.status, 302)
    await response.body?.cancel()
  })
})
