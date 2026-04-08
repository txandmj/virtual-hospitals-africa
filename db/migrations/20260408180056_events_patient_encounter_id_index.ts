import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createIndex('events_patient_encounter_id_unprocessed_idx')
    .on('events')
    .column('patient_encounter_id')
    .where(sql<boolean>`all_processed_at IS NULL`)
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema
    .dropIndex('events_patient_encounter_id_unprocessed_idx')
    .execute()
}
