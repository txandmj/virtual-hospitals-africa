import { Kysely } from 'kysely'
import { createPointerTable } from '../createTable.ts'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTable(
    db,
    'patient_record_tasks',
    {
      references: 'patient_evaluations',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb.addColumn(
        'task_id',
        'varchar(255)',
        (col) => col.notNull().references('tasks.id').onDelete('cascade'),
      ),
  )
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_record_tasks').execute()
}
