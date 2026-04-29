import { Fragment } from 'preact'
import { HealthWorkerHomePage } from '../../../_middleware.tsx'
import type { OrganizationContext } from '../../../../../types.ts'
import { DASHBOARD_WIDGETS } from '../../../../../backend/dashboard/widgets/index.ts'
import type { DashboardFilters } from '../../../../../util/dashboard/types.ts'
import { parseDateRange } from '../../../../../util/dashboard/filters.ts'
import FilterBar from '../../../../../components/dashboard/FilterBar.tsx'
import DateRangeInput from '../../../../../components/dashboard/filters/DateRangeInput.tsx'

export default HealthWorkerHomePage<OrganizationContext>(
  async function Dashboard(ctx) {
    const { trx, organization, organization_employment } = ctx.state
    const filters: DashboardFilters = { date_range: parseDateRange(ctx.url) }

    const visible = DASHBOARD_WIDGETS.filter((w) => w.canSee(organization_employment))
    const items = await Promise.all(
      visible.map(async (w) => ({
        id: w.id,
        element: w.render(
          await w.fetch(
            { trx, organization_id: organization.id, employment: organization_employment },
            filters,
          ),
        ),
      })),
    )

    return {
      title: `${organization.name} Dashboard`,
      children: (
        <>
          <FilterBar action={ctx.url.pathname}>
            <DateRangeInput value={filters.date_range} />
          </FilterBar>
          <div class='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {items.length === 0
              ? <div class='col-span-3 text-gray-500'>No widgets available for your role yet.</div>
              : items.map(({ id, element }) => <Fragment key={id}>{element}</Fragment>)}
          </div>
        </>
      ),
    }
  },
)
