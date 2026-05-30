import { sql } from 'kysely'
import { PostgresInterval, RenderedNotification, TrxOrDbOrQueryCreator } from '../../types.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'
import { base } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'

type Terms = {
  health_worker_id: string
  past_ts?: number | Date
  only_unread?: boolean
  recent_first?: boolean
}

export const notifications = base({
  top_level_table: 'health_worker_web_notifications',
  baseQuery(trx, terms: Terms) {
    assertOr400(terms.health_worker_id)
    return trx
      .selectFrom('health_worker_web_notifications')
      .selectAll('health_worker_web_notifications')
      .select(
        sql<
          PostgresInterval
        >`(current_timestamp - health_worker_web_notifications.created_at)::interval`
          .as('wait_time'),
      )
      .where('health_worker_id', '=', terms.health_worker_id)
      .orderBy(
        'health_worker_web_notifications.created_at',
        terms?.recent_first ? 'desc' : 'asc',
      )
      .$if(
        !!terms?.past_ts,
        (qb) =>
          qb.where(
            'health_worker_web_notifications.created_at',
            '>',
            new Date(terms?.past_ts!),
          ),
      )
      .$if(
        !!terms?.only_unread,
        (qb) =>
          qb.where(
            'health_worker_web_notifications.seen_at',
            'is',
            null,
          ),
      )
  },
  formatResult({ id, wait_time, action_title, action_href, ...n }): RenderedNotification {
    return (
      {
        ...n,
        notification_id: id,
        time_display: timeAgoDisplay(wait_time),
        action: {
          title: action_title,
          href: action_href,
        },
      }
    )
  },
  insert(
    trx: TrxOrDbOrQueryCreator,
    { health_worker_id, employment_id, patient_encounter_id, ...notification }:
      & {
        action_title: string
        action_href: string
        avatar_url: string
        description: string
        table_name: string
        row_id: string
        notification_type: string
        title: string
        patient_encounter_id?: string | null
      }
      & (
        | { health_worker_id: string; employment_id?: never }
        | { health_worker_id?: never; employment_id: string }
      ),
  ): Promise<{ id: string }> {
    return trx
      .insertInto('health_worker_web_notifications')
      .values({
        ...notification,
        patient_encounter_id: patient_encounter_id ?? null,
        health_worker_id: health_worker_id ||
          trx.selectFrom('employment').select('health_worker_id').where(
            'id',
            '=',
            employment_id!,
          ),
      })
      .returning('id')
      .executeTakeFirstOrThrow()
  },
})
