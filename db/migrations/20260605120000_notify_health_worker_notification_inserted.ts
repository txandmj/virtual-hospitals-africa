import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await sql`
    CREATE OR REPLACE FUNCTION notify_health_worker_notification_inserted()
    RETURNS TRIGGER AS $$
    BEGIN
      PERFORM pg_notify('health_worker_notification_inserted', json_build_object(
        'id', NEW.id,
        'health_worker_id', NEW.health_worker_id
      )::text);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)

  await sql`
    CREATE TRIGGER health_worker_notification_inserted_trigger
    AFTER INSERT ON health_worker_web_notifications
    FOR EACH ROW
    EXECUTE FUNCTION notify_health_worker_notification_inserted();
  `.execute(db)
}

export async function down(db: Kysely<DB>) {
  await sql`DROP TRIGGER IF EXISTS health_worker_notification_inserted_trigger ON health_worker_web_notifications`.execute(db)
  await sql`DROP FUNCTION IF EXISTS notify_health_worker_notification_inserted`.execute(db)
}
