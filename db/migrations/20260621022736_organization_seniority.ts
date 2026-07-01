import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.alterTable('employment')
    .addColumn('seniority_order', 'integer', (col) => col.notNull())
    .execute()

  await db.schema.alterTable('employment').addUniqueConstraint(
    'unique_organization_seniority_order',
    ['organization_id', 'seniority_order'],
  )
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.alterTable('employment').dropColumn('seniority_order').execute()
}
