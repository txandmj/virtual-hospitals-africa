import { events } from '../../../db/models/events.ts'
import EventsTable from '../../../components/superadmin/EventsTable.tsx'
import { SuperadminPage } from './_middleware.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import Pagination from '../../../components/library/Pagination.tsx'
import { SearchInput } from '../../../islands/form/inputs/search.tsx'

export default SuperadminPage(async function Events(ctx) {
  const search = ctx.url.searchParams.get('search') || undefined
  const type = ctx.url.searchParams.get('type') || undefined
  const page = searchPage(ctx)

  const { results, has_next_page } = await events.search(
    ctx.state.trx,
    { search, type },
    { page },
  )

  return {
    title: 'Events',
    children: (
      <form>
        <SearchInput value={search} />
        <EventsTable rows={results} />
        <Pagination page={page} has_next_page={has_next_page} />
      </form>
    ),
  }
})
