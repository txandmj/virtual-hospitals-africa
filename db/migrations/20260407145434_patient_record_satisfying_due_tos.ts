import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'patient_record_satisfying_due_tos', (qb) =>
    qb
      .addColumn('patient_record_id', 'uuid', (col) => col.notNull().references('patient_records.id').onDelete('cascade'))
      .addColumn('due_to_id', 'uuid', (col) => col.notNull().references('due_to.id').onDelete('cascade')))
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_record_satisfying_due_tos').execute()
}
