import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .alterTable('patient_triage_level')
    .addColumn('system_priority_evaluation_id', 'varchar(255)', (col) => col.references('system_priority_evaluations.id').onDelete('cascade'))
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema
    .alterTable('patient_triage_level')
    .dropColumn('system_priority_evaluation_id')
    .execute()
}
