import { afterEach, describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { type Stub, stub } from 'std/testing/mock.ts'
import {
  initializeWebPushDispatcher,
  type InitializeWebPushDispatcherDeps,
  startWebPushDispatcherAtStartup,
} from '../../../shared/notifications/initialize_web_push_dispatcher.ts'
import type { DispatchWebPushForNotificationInput } from '../../../shared/notifications/dispatch_web_push_for_notification.ts'
import generateUUID from '../../../util/uuid.ts'

const _WEB_PUSH_DISPATCHER_GLOBAL_KEY = '__vha_webPushDispatcherInitialized__'

type NotificationInsertedPayload = {
  id: string
  health_worker_id: string
}

function createMockPubSub() {
  const any_callbacks: Array<(notification: NotificationInsertedPayload) => void> = []
  return {
    any_callbacks,
    pub_sub: {
      any: {
        subscribe(callback: (notification: NotificationInsertedPayload) => void) {
          any_callbacks.push(callback)
        },
        unsubscribe(callback: (notification: NotificationInsertedPayload) => void) {
          const index = any_callbacks.indexOf(callback)
          if (index >= 0) any_callbacks.splice(index, 1)
        },
      },
      by_health_worker_id: {
        subscribe: () => {},
        unsubscribe: () => {},
      },
      shutdown: async () => {},
    },
  }
}

function createDeps(
  {
    dispatchWebPushForNotification = async () => {},
  }: {
    dispatchWebPushForNotification?: (input: DispatchWebPushForNotificationInput) => Promise<void>
  } = {},
) {
  const { any_callbacks, pub_sub } = createMockPubSub()
  const deps: InitializeWebPushDispatcherDeps = {
    initializeNotificationsPubSub: async () => pub_sub,
    dispatchWebPushForNotification,
  }
  return { any_callbacks, deps }
}

describe('shared/notifications/initialize_web_push_dispatcher.ts', () => {
  let log_error: Stub | undefined

  afterEach(() => {
    // deno-lint-ignore no-explicit-any
    delete (globalThis as any)[_WEB_PUSH_DISPATCHER_GLOBAL_KEY]
    log_error?.restore()
    log_error = undefined
  })

  describe('initializeWebPushDispatcher', () => {
    it('subscribes to pub_sub.any', async () => {
      const { any_callbacks, deps } = createDeps()

      await initializeWebPushDispatcher(deps)

      assertEquals(any_callbacks.length, 1)
    })

    it('calls the dispatcher when a global notification event is received', async () => {
      const notification_id = generateUUID()
      const health_worker_id = generateUUID()
      const dispatch_calls: DispatchWebPushForNotificationInput[] = []
      const dispatch_finished = Promise.withResolvers<void>()
      const { any_callbacks, deps } = createDeps({
        dispatchWebPushForNotification: async (input) => {
          dispatch_calls.push(input)
          dispatch_finished.resolve()
        },
      })

      await initializeWebPushDispatcher(deps)
      for (const callback of any_callbacks) {
        callback({ id: notification_id, health_worker_id })
      }
      await dispatch_finished.promise

      assertEquals(dispatch_calls, [{ notification_id, health_worker_id }])
    })

    it('does not register the callback twice when initialized more than once', async () => {
      const { any_callbacks, deps } = createDeps()

      await initializeWebPushDispatcher(deps)
      await initializeWebPushDispatcher(deps)

      assertEquals(any_callbacks.length, 1)
    })

    it('logs dispatcher rejections without throwing from the pub/sub callback', async () => {
      const notification_id = generateUUID()
      const health_worker_id = generateUUID()
      const dispatch_failed = Promise.withResolvers<void>()
      log_error = stub(console, 'error')
      const { any_callbacks, deps } = createDeps({
        dispatchWebPushForNotification: () => {
          dispatch_failed.resolve()
          return Promise.reject(new Error('dispatch failed'))
        },
      })

      await initializeWebPushDispatcher(deps)
      for (const callback of any_callbacks) {
        callback({ id: notification_id, health_worker_id })
      }
      await dispatch_failed.promise
      await new Promise((resolve) => setTimeout(resolve, 0))

      assertEquals(log_error.calls.length, 1)
      assertEquals(log_error.calls[0]?.args[0], 'notifications web push dispatch failed')
      assertEquals(log_error.calls[0]?.args[1], {
        notification_id,
        health_worker_id,
        error: new Error('dispatch failed'),
      })
    })
  })

  describe('startWebPushDispatcherAtStartup', () => {
    it('invokes initializeWebPushDispatcher when external connect is enabled', async () => {
      let calls = 0
      startWebPushDispatcherAtStartup({
        no_external_connect: false,
        initializeWebPushDispatcher: async () => {
          calls++
        },
      })
      await new Promise((resolve) => setTimeout(resolve, 0))

      assertEquals(calls, 1)
    })

    it('does not invoke initializeWebPushDispatcher when NO_EXTERNAL_CONNECT is set', async () => {
      let calls = 0
      startWebPushDispatcherAtStartup({
        no_external_connect: true,
        initializeWebPushDispatcher: async () => {
          calls++
        },
      })
      await new Promise((resolve) => setTimeout(resolve, 0))

      assertEquals(calls, 0)
    })

    it('does not register a second pub/sub callback when startup runs after initialization', async () => {
      const { any_callbacks, deps } = createDeps()

      await initializeWebPushDispatcher(deps)
      startWebPushDispatcherAtStartup({
        no_external_connect: false,
        initializeWebPushDispatcher: () => initializeWebPushDispatcher(deps),
      })
      await new Promise((resolve) => setTimeout(resolve, 0))

      assertEquals(any_callbacks.length, 1)
    })

    it('logs rejected initializer without escaping as an unhandled rejection', async () => {
      const initialize_failed = Promise.withResolvers<void>()
      log_error = stub(console, 'error')
      startWebPushDispatcherAtStartup({
        no_external_connect: false,
        initializeWebPushDispatcher: () => {
          initialize_failed.resolve()
          return Promise.reject(new Error('initialize failed'))
        },
      })
      await initialize_failed.promise
      await new Promise((resolve) => setTimeout(resolve, 0))

      assertEquals(log_error.calls.length, 1)
      assertEquals(log_error.calls[0]?.args[0], 'failed to initialize web push dispatcher')
      assertEquals(log_error.calls[0]?.args[1], { error: new Error('initialize failed') })
    })
  })
})
