import webpush from 'web-push'
import { readMandatoryStringEnvironmentVariable } from '../util/env.ts'

export const vapid_public_key = readMandatoryStringEnvironmentVariable(
  'VAPID_PUBLIC_KEY',
)

const vapid_private_key = readMandatoryStringEnvironmentVariable(
  'VAPID_PRIVATE_KEY',
)
const vapid_subject = readMandatoryStringEnvironmentVariable(
  'VAPID_SUBJECT',
)

export const vapid_server_config = {
  private_key: vapid_private_key,
  subject: vapid_subject,
}

webpush.setVapidDetails(
  vapid_server_config.subject,
  vapid_public_key,
  vapid_server_config.private_key,
)

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
