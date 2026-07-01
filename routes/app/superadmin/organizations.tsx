import { organizations } from '../../../db/models/organizations.ts'
import OrganizationsTable from '../../../components/superadmin/OrganizationsTable.tsx'
import { SuperadminPage } from './_middleware.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import Pagination from '../../../components/library/Pagination.tsx'
import { SearchInput } from '../../../islands/form/inputs/search.tsx'

export default SuperadminPage(async function Organizations(ctx) {
  const search = ctx.url.searchParams.get('search') || undefined
  const page = searchPage(ctx)

  const { results, has_next_page } = await organizations.search(
    ctx.state.trx,
    { search, include_all_countries: true },
    { page },
  )

  return {
    title: 'Organizations',
    children: (
      <form>
        <SearchInput value={search} />
        <OrganizationsTable organizations={results} />
        <Pagination page={page} has_next_page={has_next_page} />
      </form>
    ),
  }
})
