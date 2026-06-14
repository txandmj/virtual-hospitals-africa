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
      'notifies global and matching health worker subscribers when a notification is inserted',
      async () => {
        const health_worker = await addTestEmployee(db, { role: 'nurse' })
        const other_health_worker = await addTestEmployee(db, { role: 'nurse' })
        const pub_sub = await notifications.initializeNotificationsPubSub()
        const global_received = Promise.withResolvers<{ id: string; health_worker_id: string }>()
        const matching_received = Promise.withResolvers<string>()
        const other_received = Promise.withResolvers<string>()
        const global_callback = (notification: { id: string; health_worker_id: string }) => global_received.resolve(notification)
        const matching_callback = (notification_id: string) => matching_received.resolve(notification_id)
        const other_callback = (notification_id: string) => other_received.resolve(notification_id)
        pub_sub.any.subscribe(global_callback)
        pub_sub.by_health_worker_id.subscribe(health_worker.id, matching_callback)
        pub_sub.by_health_worker_id.subscribe(other_health_worker.id, other_callback)

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
            assertEquals(await Promise.race([global_received.promise, timer]), {
              id,
              health_worker_id: health_worker.id,
            })
            assertEquals(await Promise.race([matching_received.promise, timer]), id)
            const not_received = new Promise<string>((resolve) => {
              setTimeout(() => resolve('not-received'), 250)
            })
            assertEquals(await Promise.race([other_received.promise, not_received]), 'not-received')
          } finally {
            timer.cancel()
          }
        } finally {
          pub_sub.any.unsubscribe(global_callback)
          pub_sub.by_health_worker_id.unsubscribe(health_worker.id, matching_callback)
          pub_sub.by_health_worker_id.unsubscribe(other_health_worker.id, other_callback)
        }
      },
    )

    it(
      'still notifies other subscribers when one subscriber throws',
      async () => {
        const health_worker = await addTestEmployee(db, { role: 'nurse' })
        const pub_sub = await notifications.initializeNotificationsPubSub()
        const received = Promise.withResolvers<string>()
        const throwing_callback = () => {
          throw new Error('subscriber failed')
        }
        const succeeding_callback = (notification_id: string) => received.resolve(notification_id)
        pub_sub.by_health_worker_id.subscribe(health_worker.id, throwing_callback)
        pub_sub.by_health_worker_id.subscribe(health_worker.id, succeeding_callback)

        try {
          const { id } = await notifications.insert(db, {
            health_worker_id: health_worker.id,
            title: 'Test notification',
            description: 'Test description',
            avatar_url: '/images/test.svg',
            table_name: 'patient_encounters',
            row_id: '00000000-0000-1000-8000-000000000098',
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
          pub_sub.by_health_worker_id.unsubscribe(health_worker.id, throwing_callback)
          pub_sub.by_health_worker_id.unsubscribe(health_worker.id, succeeding_callback)
        }
      },
    )
  })
})
