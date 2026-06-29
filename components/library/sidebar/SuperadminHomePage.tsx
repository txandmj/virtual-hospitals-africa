import { GenericSidebar } from './Generic.tsx'
import { superadmin_home_page_nav_links } from './home_page_links/superadmin.ts'
import { HealthWorkerDefaultTop } from './Top.tsx'

export function SuperadminHomePageSidebar(
  { route, params, urlSearchParams }: {
    route: string
    params: Record<string, string>
    urlSearchParams: URLSearchParams
  },
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      urlSearchParams={urlSearchParams}
      nav_links={superadmin_home_page_nav_links}
      top={<HealthWorkerDefaultTop />}
    />
  )
}
