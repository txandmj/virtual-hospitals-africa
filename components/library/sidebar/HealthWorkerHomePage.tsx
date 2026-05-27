import { ComponentChild } from 'preact'
import { practitionerHomePageNavLinks } from './home_page_links/health_worker.ts'
import { HealthWorkerDefaultTop } from './Top.tsx'
import { GenericSidebar } from './Generic.tsx'

export type HealthWorkerHomePageSidebarProps = {
  route: string
  params: Record<string, string>
  urlSearchParams: URLSearchParams
  health_worker_notification_count: number
  bottom?: ComponentChild
  tutorial?: boolean
}

export function HealthWorkerHomePageSidebar(
  { route, params, urlSearchParams, health_worker_notification_count, bottom, tutorial }: HealthWorkerHomePageSidebarProps,
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      urlSearchParams={urlSearchParams}
      nav_links={practitionerHomePageNavLinks({ health_worker_notification_count })}
      top={<HealthWorkerDefaultTop />}
      bottom={bottom}
      tutorial={tutorial}
    />
  )
}
