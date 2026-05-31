import { sql } from 'kysely'
import {
  isPriority,
  ORDERED_PRIORITIES,
  PRIORITY_SNOMED_CODES,
  Priority,
} from '../../shared/priorities.ts'
import {
  NonEmptyArray,
  PostgresInterval,
  RenderedNotification,
  TrxOrDb,
  TrxOrDbOrQueryCreator,
} from '../../types.ts'
import { orderByArrayPosition } from '../helpers.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'
import { base } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'

// Deceased is in ORDERED_PRIORITIES but is not assigned as a live encounter triage level.
const ENCOUNTER_ORDERED_PRIORITIES = ORDERED_PRIORITIES.filter(
  (priority) => priority !== 'Deceased',
) as NonEmptyArray<Priority>

const ENCOUNTER_PRIORITY_SNOMED_ORDER = ENCOUNTER_ORDERED_PRIORITIES.map(
  (priority) => PRIORITY_SNOMED_CODES[priority],
) as NonEmptyArray<string>

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
  async highestUnreadPriority(
    trx: TrxOrDb,
    { health_worker_id }: { health_worker_id: string },
  ): Promise<Priority | null> {
    assertOr400(health_worker_id)
    const row = await trx
      .selectFrom((eb) =>
        eb
          .selectFrom('health_worker_web_notifications')
          .where('health_worker_id', '=', health_worker_id)
          .where('seen_at', 'is', null)
          .where('patient_encounter_id', 'is not', null)
          .select((eb_notification) =>
            eb_notification
              .selectFrom('patient_triage_level')
              .innerJoin(
                'patient_records',
                'patient_triage_level.id',
                'patient_records.id',
              )
              .innerJoin(
                'patient_records_still_valid',
                'patient_records.id',
                'patient_records_still_valid.id',
              )
              .innerJoin(
                'snomed_inferred_canonical_name_and_category',
                'patient_records.value_snomed_concept_id',
                'snomed_inferred_canonical_name_and_category.id',
              )
              .whereRef(
                'patient_records.patient_encounter_id',
                '=',
                'health_worker_web_notifications.patient_encounter_id',
              )
              .where((eb_x) =>
                eb_x.exists(
                  trx
                    .selectFrom('patient_records_still_valid as associated_findings_still_valid')
                    .innerJoin(
                      'patient_record_relations as triage_relations',
                      'triage_relations.destination_id',
                      'associated_findings_still_valid.id',
                    )
                    .where(
                      'triage_relations.source_id',
                      '=',
                      eb_x.ref('patient_triage_level.id'),
                    ),
                )
              )
              .select('snomed_inferred_canonical_name_and_category.name')
              .orderBy((eb_triage_level) =>
                orderByArrayPosition(
                  eb_triage_level,
                  'patient_records.value_snomed_concept_id',
                  ENCOUNTER_PRIORITY_SNOMED_ORDER,
                ),
                'desc',
              )
              .limit(1)
              .as('encounter_priority'),
          )
          .as('unread_encounter_notification_priorities')
      )
      .where('encounter_priority', 'is not', null)
      .select('encounter_priority')
      .orderBy((eb) =>
        orderByArrayPosition(
          eb,
          'encounter_priority',
          ENCOUNTER_ORDERED_PRIORITIES,
        ),
        'desc',
      )
      .limit(1)
      .executeTakeFirst()

    const priority = row?.encounter_priority
    return priority && isPriority(priority) ? priority : null
  },
})
