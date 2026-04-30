import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { dashboard_metrics } from '../../../db/models/dashboard_metrics.ts'
import Card from '../../../components/dashboard/Card.tsx'

export const staff_on_shift_widget: WidgetDef<number> = {
  id: 'staff_on_shift',
  canSee: () => true,
  fetch: ({ trx, organization_id }) => dashboard_metrics.staffOnShift(trx, { organization_id }),
  render: (count) => <Card label='Staff on shift' value={count} />,
}
