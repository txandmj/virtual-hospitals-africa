import { notifications } from '../../db/models/notifications.ts'
import { NO_EXTERNAL_CONNECT } from '../../util/env.ts'
import { dispatchWebPushForNotification } from './dispatch_web_push_for_notification.ts'

const _WEB_PUSH_DISPATCHER_GLOBAL_KEY = '__vha_webPushDispatcherInitialized__'

type NotificationInsertedPayload = {
  id: string
  health_worker_id: string
}

type NotificationsPubSub = Awaited<ReturnType<typeof notifications.initializeNotificationsPubSub>>

export type InitializeWebPushDispatcherDeps = {
  initializeNotificationsPubSub: () => Promise<NotificationsPubSub>
  dispatchWebPushForNotification: typeof dispatchWebPushForNotification
}

const default_deps: InitializeWebPushDispatcherDeps = {
  initializeNotificationsPubSub: notifications.initializeNotificationsPubSub.bind(notifications),
  dispatchWebPushForNotification,
}

export type StartWebPushDispatcherAtStartupDeps = {
  no_external_connect?: boolean
  initializeWebPushDispatcher?: () => Promise<void>
}

export function startWebPushDispatcherAtStartup(
  deps: StartWebPushDispatcherAtStartupDeps = {},
): void {
  if (deps.no_external_connect ?? NO_EXTERNAL_CONNECT) return

  // LISTEN-based delivery assumes a single vha-app instance; multiple application
  // instances would each receive the same PostgreSQL NOTIFY and could send duplicate pushes.
  void (deps.initializeWebPushDispatcher ?? initializeWebPushDispatcher)()
    .catch((error) => {
      console.error('failed to initialize web push dispatcher', { error })
    })
}

export async function initializeWebPushDispatcher(
  deps: InitializeWebPushDispatcherDeps = default_deps,
): Promise<void> {
  // deno-lint-ignore no-explicit-any
  const global_scope = globalThis as any
  if (global_scope[_WEB_PUSH_DISPATCHER_GLOBAL_KEY]) return

  const pub_sub = await deps.initializeNotificationsPubSub()

  pub_sub.any.subscribe(({ id, health_worker_id }: NotificationInsertedPayload) => {
    void deps.dispatchWebPushForNotification({
      notification_id: id,
      health_worker_id,
    }).catch((error) => {
      console.error('notifications web push dispatch failed', {
        notification_id: id,
        health_worker_id,
        error,
      })
    })
  })

  global_scope[_WEB_PUSH_DISPATCHER_GLOBAL_KEY] = true
}
