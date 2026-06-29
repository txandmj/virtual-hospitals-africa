import { events } from '../../../../../../db/models/events.ts'
import { SuperadminPage } from '../../../_middleware.tsx'
import { getRequiredParam, getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { assertOr404 } from '../../../../../../util/assertOr.ts'
import Badge from '../../../../../../components/library/Badge.tsx'
import { LocalTime } from '../../../../../../islands/LocalTime.tsx'
import { Button } from '../../../../../../components/library/Button.tsx'

export default SuperadminPage(async function ListenerDetail(ctx) {
  const event_id = getRequiredUUIDParam(ctx, 'event_id')
  const listener_name = getRequiredParam(ctx, 'listener_name')

  const listener = await events.getListenerOfEvent(ctx.state.trx, { event_id, listener_name })
  assertOr404(listener, `Listener "${listener_name}" not found for event ${event_id}`)

  const status = listener.error_message ? 'error' : listener.processed_at ? 'processed' : listener.started_processing_at ? 'processing' : 'pending'

  const status_color = {
    processed: 'green',
    error: 'red',
    processing: 'blue',
    pending: 'yellow',
  } as const

  return {
    title: `${listener_name}`,
    children: (
      <div class='flex flex-col gap-6 max-w-4xl'>
        <div>
          <Button href='/app/superadmin/events' variant='tertiary'>&larr; Back to Events</Button>
        </div>

        <dl class='grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm'>
          <dt class='font-semibold text-gray-500'>Listener</dt>
          <dd>{listener_name}</dd>

          <dt class='font-semibold text-gray-500'>Event Type</dt>
          <dd>{listener.type}</dd>

          <dt class='font-semibold text-gray-500'>Event ID</dt>
          <dd class='font-mono text-xs'>{event_id}</dd>

          <dt class='font-semibold text-gray-500'>Status</dt>
          <dd>
            <Badge color={status_color[status]} content={status} />
          </dd>

          {listener.started_processing_at && (
            <>
              <dt class='font-semibold text-gray-500'>Started Processing</dt>
              <dd>
                <LocalTime timestamp={listener.started_processing_at} expected_time_range='any' />
              </dd>
            </>
          )}

          {listener.processed_at && (
            <>
              <dt class='font-semibold text-gray-500'>Processed At</dt>
              <dd>
                <LocalTime timestamp={listener.processed_at} expected_time_range='any' />
              </dd>
            </>
          )}

          {listener.success_message && (
            <>
              <dt class='font-semibold text-gray-500'>Success Message</dt>
              <dd class='whitespace-pre-wrap'>{listener.success_message}</dd>
            </>
          )}

          {listener.error_message && (
            <>
              <dt class='font-semibold text-gray-500'>Error Message</dt>
              <dd class='whitespace-pre-wrap text-red-700 bg-red-50 rounded-md p-3 font-mono text-xs'>{listener.error_message}</dd>
            </>
          )}
        </dl>

        <div>
          <h3 class='font-semibold text-gray-900 mb-2'>Event Data</h3>
          <pre class='bg-gray-50 rounded-md p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap'>{JSON.stringify(listener.data, null, 2)}</pre>
        </div>
      </div>
    ),
  }
})
