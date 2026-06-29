import { patients } from '../../../db/models/patients.ts'
import PatientsTable from '../../../components/superadmin/PatientsTable.tsx'
import { SuperadminPage } from './_middleware.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import Pagination from '../../../components/library/Pagination.tsx'
import { SearchInput } from '../../../islands/form/inputs/search.tsx'

export default SuperadminPage(async function Patients(ctx) {
  const search = ctx.url.searchParams.get('search') || undefined
  const page = searchPage(ctx)

  const { results, has_next_page } = await patients.search(
    ctx.state.trx,
    { search, include_incomplete_registration: true },
    { page },
  )

  return {
    title: 'Patients',
    children: (
      <form>
        <SearchInput value={search} />
        <PatientsTable patients={results} />
        <Pagination page={page} has_next_page={has_next_page} />
      </form>
    ),
  }
})
