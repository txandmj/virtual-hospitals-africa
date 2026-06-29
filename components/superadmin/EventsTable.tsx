import { JSX } from 'preact'
import Table, { TableColumn } from '../library/Table.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { BoltIcon } from '../library/icons/heroicons/outline.tsx'
import Badge from '../library/Badge.tsx'
import type { RenderedEventListenerStatus, RenderedEventRow } from '../../types.ts'

const listener_status_color = {
  processed: 'green',
  error: 'red',
  processing: 'blue',
  pending: 'yellow',
} as const

function ListenerLink({ event_id, listener }: { event_id: string; listener: RenderedEventListenerStatus }) {
  return (
    <a
      href={`/app/superadmin/events/${event_id}/listeners/${listener.listener_name}`}
      class='flex items-center gap-1.5 text-indigo-600 hover:text-indigo-900 text-xs'
    >
      <span>{listener.listener_name}</span>
      <Badge color={listener_status_color[listener.status]} content={listener.status} />
    </a>
  )
}

export default function EventsTable({ rows }: { rows: RenderedEventRow[] }): JSX.Element {
  const columns: TableColumn<RenderedEventRow>[] = [
    {
      label: 'Type',
      data: 'type',
    },
    {
      label: 'Created',
      type: 'date',
      data: 'created_at',
    },
    {
      label: 'Listeners',
      data(row) {
        return (
          <div class='flex flex-col gap-1'>
            {row.listeners.map((listener) => <ListenerLink key={listener.listener_name} event_id={row.id} listener={listener} />)}
          </div>
        )
      },
    },
    {
      label: 'Error',
      data(row) {
        if (!row.error_message) return null
        return row.error_message.length > 80 ? row.error_message.slice(0, 80) + '...' : row.error_message
      },
    },
  ]

  return (
    <Table
      columns={columns}
      rows={rows}
      EmptyState={() => (
        <EmptyState
          header='No events'
          explanation='No events match your search'
          Icon={BoltIcon}
        />
      )}
    />
  )
}
