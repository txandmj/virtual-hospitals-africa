import { vapid_public_key, vapid_server_config } from './web-push-config.ts'

type WebPushClient = {
  setVapidDetails(subject: string, publicKey: string, privateKey: string): void
  sendNotification(subscription: ReturnType<typeof webPushSubscriptionFromRow>, payload: string): Promise<void>
}

let webpush_promise: Promise<WebPushClient> | undefined

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function webPushClientFromModule(mod: unknown): WebPushClient {
  if (!isObject(mod)) throw new Error('web-push module must be an object')
  const candidate = isObject(mod.default) ? mod.default : mod
  const setVapidDetails = candidate.setVapidDetails
  const sendNotification = candidate.sendNotification
  if (typeof setVapidDetails !== 'function') throw new Error('web-push module missing setVapidDetails')
  if (typeof sendNotification !== 'function') throw new Error('web-push module missing sendNotification')
  return {
    setVapidDetails: (subject, publicKey, privateKey) => setVapidDetails.call(candidate, subject, publicKey, privateKey),
    sendNotification: (subscription, payload) => sendNotification.call(candidate, subscription, payload),
  }
}

async function getWebPushClient(): Promise<WebPushClient> {
  if (!webpush_promise) {
    webpush_promise = (async () => {
      const mod = await import(/* @vite-ignore */ 'web-push')
      const webpush = webPushClientFromModule(mod)
      webpush.setVapidDetails(
        vapid_server_config.subject,
        vapid_public_key,
        vapid_server_config.private_key,
      )
      return webpush
    })()
  }
  return webpush_promise
}

export type WebPushNotificationPayload = {
  title: string
  body: string
  url?: string
  notification_id?: string
}

export type WebPushSubscriptionInput = {
  endpoint: string
  p256dh: string
  auth: string
}

export function webPushSubscriptionFromRow({
  endpoint,
  p256dh,
  auth,
}: WebPushSubscriptionInput) {
  return {
    endpoint,
    keys: {
      p256dh,
      auth,
    },
  }
}

const EXPIRED_WEB_PUSH_STATUS_CODES = new Set([404, 410])

export function isExpiredWebPushSubscriptionError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('statusCode' in error)) return false
  const { statusCode } = error
  return typeof statusCode === 'number' && EXPIRED_WEB_PUSH_STATUS_CODES.has(statusCode)
}

export type SendWebPushNotificationResult =
  | { ok: true }
  | { ok: false; error: unknown; expired_subscription: boolean }

export async function sendWebPushNotification({
  endpoint,
  p256dh,
  auth,
  payload,
}: WebPushSubscriptionInput & { payload: WebPushNotificationPayload }): Promise<SendWebPushNotificationResult> {
  try {
    const webpush = await getWebPushClient()
    await webpush.sendNotification(
      webPushSubscriptionFromRow({ endpoint, p256dh, auth }),
      JSON.stringify(payload),
    )
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error,
      expired_subscription: isExpiredWebPushSubscriptionError(error),
    }
  }
}
