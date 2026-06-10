import type { DB } from '../../db.d.ts'
import { SelectShape, TrxOrDb } from '../../types.ts'

type HealthWorkerWebPushSubscription = SelectShape<
  DB['health_worker_web_push_subscriptions']
>

export const health_worker_web_push_subscriptions = {
  upsertForHealthWorker(
    trx: TrxOrDb,
    {
      health_worker_id,
      endpoint,
      p256dh,
      auth,
      user_agent,
    }: {
      health_worker_id: string
      endpoint: string
      p256dh: string
      auth: string
      user_agent?: string
    },
  ): Promise<HealthWorkerWebPushSubscription> {
    return trx
      .insertInto('health_worker_web_push_subscriptions')
      .values({
        health_worker_id,
        endpoint,
        p256dh,
        auth,
        user_agent: user_agent ?? null,
      })
      .onConflict((oc) =>
        oc.column('endpoint').doUpdateSet({
          health_worker_id,
          p256dh,
          auth,
          user_agent: user_agent ?? null,
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow()
  },
  listByHealthWorkerId(
    trx: TrxOrDb,
    { health_worker_id }: { health_worker_id: string },
  ): Promise<HealthWorkerWebPushSubscription[]> {
    return trx
      .selectFrom('health_worker_web_push_subscriptions')
      .selectAll()
      .where('health_worker_id', '=', health_worker_id)
      .orderBy('created_at', 'asc')
      .execute()
  },
  deleteByEndpoint(
    trx: TrxOrDb,
    { endpoint }: { endpoint: string },
  ) {
    return trx
      .deleteFrom('health_worker_web_push_subscriptions')
      .where('endpoint', '=', endpoint)
      .execute()
  },
}
