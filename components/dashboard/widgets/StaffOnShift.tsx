import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { dashboard_metrics } from '../../../db/models/dashboard_metrics.ts'
import Card from '../Card.tsx'

export const staffOnShiftWidget: WidgetDef<number> = {
  id: 'staff_on_shift',
  canSee: () => true,
  fetch: ({ trx, organization_id }) => dashboard_metrics.staffOnShift(trx, { organization_id }),
  render: (count) => <Card label='Staff on shift' value={count} />,
}
