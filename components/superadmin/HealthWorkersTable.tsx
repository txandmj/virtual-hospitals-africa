import { JSX } from 'preact'
import Table, { TableColumn } from '../library/Table.tsx'
import { Person } from '../library/Person.tsx'
import { RenderedHealthWorker } from '../../types.ts'
import { EmptyState } from '../library/EmptyState.tsx'
import { UserGroupIcon } from '../library/icons/heroicons/outline.tsx'

export default function HealthWorkersTable({ health_workers }: { health_workers: RenderedHealthWorker[] }): JSX.Element {
  const columns: TableColumn<RenderedHealthWorker>[] = [
    {
      label: 'Health Worker',
      data(row) {
        return <Person person={{ ...row, display_name: row.name }} />
      },
    },
    {
      label: 'Email',
      data: 'email',
    },
    {
      label: 'Organizations',
      data(row) {
        return row.organizations.map((o) => o.name).join(', ')
      },
    },
  ]

  return (
    <Table
      columns={columns}
      rows={health_workers}
      EmptyState={() => (
        <EmptyState
          header='No health workers'
          explanation='No health workers match your search'
          Icon={UserGroupIcon}
        />
      )}
    />
  )
}
