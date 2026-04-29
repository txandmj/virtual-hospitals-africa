import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { ENCOUNTERS, findOrganization } from '../../../../util/dashboard/fixtures.ts'
import WidgetCard from '../../WidgetCard.tsx'

type Data = {
  total: number
  by_org: Array<{ organization_id: string; name: string; count: number }>
  scope_label: string
}

export const current_census_widget: PreviewWidgetDef<Data> = {
  id: 'current_census',
  title: 'Patients currently in care',
  span: 4,
  fetch: ({ organization_id, department }) => {
    const filtered = ENCOUNTERS.filter((enc) => {
      if (enc.closed_at) return false
      if (organization_id && enc.organization_id !== organization_id) return false
      if (department && enc.department !== department) return false
      return true
    })
    const by_org_map = new Map<string, number>()
    for (const enc of filtered) {
      by_org_map.set(enc.organization_id, (by_org_map.get(enc.organization_id) ?? 0) + 1)
    }
    const by_org = Array.from(by_org_map.entries()).map(([id, count]) => ({
      organization_id: id,
      name: findOrganization(id)?.name ?? id,
      count,
    }))
    by_org.sort((a, b) => b.count - a.count)
    const scope_label = organization_id ? findOrganization(organization_id)?.name ?? organization_id : 'All facilities'
    return { total: filtered.length, by_org, scope_label }
  },
  render: ({ total, by_org, scope_label }) => (
    <WidgetCard title='Patients currently in care' subtitle={scope_label}>
      <div class='text-3xl font-semibold text-gray-900'>{total}</div>
      {by_org.length > 1
        ? (
          <ul class='mt-3 space-y-1 text-xs text-gray-600'>
            {by_org.map((row) => (
              <li key={row.organization_id} class='flex justify-between'>
                <span>{row.name}</span>
                <span class='font-medium text-gray-800'>{row.count}</span>
              </li>
            ))}
          </ul>
        )
        : null}
    </WidgetCard>
  ),
}
