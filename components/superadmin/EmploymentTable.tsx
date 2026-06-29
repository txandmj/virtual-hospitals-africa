import { JSX } from 'preact'
import Table, { TableColumn } from '../library/Table.tsx'
import { EmptyState } from '../library/EmptyState.tsx'
import { BriefcaseIcon } from '../library/icons/heroicons/outline.tsx'
import Badge from '../library/Badge.tsx'
import type { RenderedEmploymentRow } from '../../types.ts'

export default function EmploymentTable({ rows }: { rows: RenderedEmploymentRow[] }): JSX.Element {
  const columns: TableColumn<RenderedEmploymentRow>[] = [
    {
      label: 'Health Worker',
      data: 'health_worker_name',
    },
    {
      label: 'Organization',
      data: 'organization_name',
    },
    {
      label: 'Role',
      data: 'role',
    },
    {
      label: 'Admin',
      data(row) {
        return row.is_admin ? <Badge color='green' content='Yes' /> : null
      },
    },
    {
      label: 'Seniority',
      data: 'seniority_order',
    },
    {
      label: 'Created',
      type: 'date',
      data: 'created_at',
    },
  ]

  return (
    <Table
      columns={columns}
      rows={rows}
      EmptyState={() => (
        <EmptyState
          header='No employment records'
          explanation='No employment records match your search'
          Icon={BriefcaseIcon}
        />
      )}
    />
  )
}
