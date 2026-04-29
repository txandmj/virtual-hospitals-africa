import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { dashboard_metrics } from '../../../db/models/dashboard_metrics.ts'
import Card from '../../../components/dashboard/Card.tsx'

export const patients_in_care_widget: WidgetDef<number> = {
  id: 'patients_in_care',
  canSee: () => true,
  fetch: ({ trx, organization_id }) => dashboard_metrics.patientsCurrentlyInEncounter(trx, { organization_id }),
  render: (count) => <Card label='Patients in care' value={count} />,
}
