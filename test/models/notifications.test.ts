import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { notifications } from '../../db/models/notifications.ts'
import { addTestEmployee } from '../_helpers/employees.ts'
import { timeout } from '../../util/timeout.ts'

describe('db/models/notifications.ts', () => {
  before(async () => {
    await notifications.initializeNotificationsPubSub()
  })
  afterAll(async () => {
    await notifications.closeNotificationsPubSub({ graceful: false })
    await db.destroy()
  })

  describe('initializeNotificationsPubSub', () => {
    it(
      'notifies subscribers when a notification is inserted',
      async () => {
        const health_worker = await addTestEmployee(db, { role: 'nurse' })
        const pub_sub = await notifications.initializeNotificationsPubSub()
        const received = Promise.withResolvers<string>()
        const callback = (notification_id: string) => received.resolve(notification_id)
        pub_sub.by_health_worker_id.subscribe(health_worker.id, callback)

        try {
          const { id } = await notifications.insert(db, {
            health_worker_id: health_worker.id,
            title: 'Test notification',
            description: 'Test description',
            avatar_url: '/images/test.svg',
            table_name: 'patient_encounters',
            row_id: '00000000-0000-1000-8000-000000000099',
            notification_type: 'test',
            action_title: 'View',
            action_href: '/app',
          })

          const timer = timeout(5000)
          try {
            assertEquals(await Promise.race([received.promise, timer]), id)
          } finally {
            timer.cancel()
          }
        } finally {
          pub_sub.by_health_worker_id.unsubscribe(health_worker.id, callback)
        }
      },
    )
  })
})
