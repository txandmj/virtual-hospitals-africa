import { health_workers } from '../../../db/models/health_workers.ts'
import HealthWorkersTable from '../../../components/superadmin/HealthWorkersTable.tsx'
import { SuperadminPage } from './_middleware.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import Pagination from '../../../components/library/Pagination.tsx'
import { SearchInput } from '../../../islands/form/inputs/search.tsx'

export default SuperadminPage(async function HealthWorkers(ctx) {
  const search = ctx.url.searchParams.get('search') || undefined
  const page = searchPage(ctx)

  const { results, has_next_page } = await health_workers.search(
    ctx.state.trx,
    { search },
    { page },
  )

  return {
    title: 'Health Workers',
    children: (
      <form>
        <SearchInput value={search} />
        <HealthWorkersTable health_workers={results} />
        <Pagination page={page} has_next_page={has_next_page} />
      </form>
    ),
  }
})
