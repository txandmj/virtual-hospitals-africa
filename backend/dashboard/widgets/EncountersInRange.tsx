import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { dashboard_metrics } from '../../../db/models/dashboard_metrics.ts'
import { todayUtc } from '../../../util/dashboard/dates.ts'
import Card from '../../../components/dashboard/Card.tsx'

export const encounters_in_range_widget: WidgetDef<number> = {
  id: 'encounters_in_range',
  canSee: () => true,
  fetch: ({ trx, organization_id }, { date_range }) => {
    const from = date_range.from ?? todayUtc()
    const to = date_range.to ?? todayUtc()
    return dashboard_metrics.encountersInRange(trx, { organization_id, from, to })
  },
  render: (count) => <Card label='Encounters in range' value={count} />,
}
