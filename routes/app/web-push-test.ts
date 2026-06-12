import { sendWebPushNotification } from '../../external-clients/web-push.ts'
import { health_worker_web_push_subscriptions } from '../../db/models/health_worker_web_push_subscriptions.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'
import { json } from '../../util/responses.ts'

function webPushSendErrorSummary(error: unknown): string {
  if (!error || typeof error !== 'object') return String(error)

  const summary: Record<string, unknown> = {}
  if ('name' in error && typeof error.name === 'string') summary.name = error.name
  if ('message' in error && typeof error.message === 'string') summary.message = error.message
  if ('statusCode' in error && typeof error.statusCode === 'number') summary.statusCode = error.statusCode
  if ('body' in error) summary.body = error.body
  if ('headers' in error) summary.headers = error.headers

  return Object.keys(summary).length ? JSON.stringify(summary) : String(error)
}

export const handler = {
  async POST(ctx: LoggedInHealthWorkerContext) {
    const subscriptions = await health_worker_web_push_subscriptions.listByHealthWorkerId(
      ctx.state.trx,
      { health_worker_id: ctx.state.health_worker_id },
    )

    let sent = 0
    let failed = 0
    let deleted_expired = 0
    const failed_errors: string[] = []

    for (const subscription of subscriptions) {
      const result = await sendWebPushNotification({
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        payload: {
          title: 'Test VHA notification',
          body: 'Web push notifications are working.',
          url: '/app/notifications',
        },
      })

      if (result.ok) {
        sent++
        continue
      }

      if (result.expired_subscription) {
        await health_worker_web_push_subscriptions.deleteByEndpoint(
          ctx.state.trx,
          { endpoint: subscription.endpoint },
        )
        deleted_expired++
        continue
      }

      failed++
      failed_errors.push(webPushSendErrorSummary(result.error))
    }

    return json({
      ok: true,
      subscriptions: subscriptions.length,
      sent,
      failed,
      deleted_expired,
      failed_errors,
    })
  },
}
