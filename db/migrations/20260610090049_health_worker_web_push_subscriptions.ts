import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'health_worker_web_push_subscriptions',
    (qb) =>
      qb
        .addColumn(
          'health_worker_id',
          'uuid',
          (col) => col.notNull().references('health_workers.id').onDelete('cascade'),
        )
        .addColumn('endpoint', 'text', (col) => col.notNull())
        .addColumn('p256dh', 'text', (col) => col.notNull())
        .addColumn('auth', 'text', (col) => col.notNull())
        .addColumn('user_agent', 'text')
        .addUniqueConstraint(
          'unique_health_worker_web_push_subscription_endpoint',
          ['endpoint'],
        ),
  )

  await db.schema
    .createIndex('idx_health_worker_web_push_subscriptions_health_worker_id')
    .on('health_worker_web_push_subscriptions')
    .column('health_worker_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema
    .dropIndex('idx_health_worker_web_push_subscriptions_health_worker_id')
    .execute()
  await db.schema.dropTable('health_worker_web_push_subscriptions').execute()
}
