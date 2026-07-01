import { employment } from '../../../db/models/employment.ts'
import EmploymentTable from '../../../components/superadmin/EmploymentTable.tsx'
import { SuperadminPage } from './_middleware.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import Pagination from '../../../components/library/Pagination.tsx'
import { SearchInput } from '../../../islands/form/inputs/search.tsx'

export default SuperadminPage(async function Employment(ctx) {
  const search = ctx.url.searchParams.get('search') || undefined
  const page = searchPage(ctx)

  const { results, has_next_page } = await employment.search(
    ctx.state.trx,
    { search },
    { page },
  )

  return {
    title: 'Employment',
    children: (
      <form>
        <SearchInput value={search} />
        <EmploymentTable rows={results} />
        <Pagination page={page} has_next_page={has_next_page} />
      </form>
    ),
  }
})
