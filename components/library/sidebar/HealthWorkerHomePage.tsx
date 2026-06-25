import { ComponentChild } from 'preact'
import type { Priority } from '../../../shared/priorities.ts'
import { practitionerHomePageNavLinks } from './home_page_links/health_worker.ts'
import { HealthWorkerDefaultTop } from './Top.tsx'
import { GenericSidebar } from './Generic.tsx'

export type HealthWorkerHomePageSidebarProps = {
  route: string
  params: Record<string, string>
  urlSearchParams: URLSearchParams
  health_worker_notification_count: number
  health_worker_notification_priority: Priority | null
  bottom?: ComponentChild
  tutorial?: boolean
}

export function HealthWorkerHomePageSidebar(
  {
    route,
    params,
    urlSearchParams,
    health_worker_notification_count,
    health_worker_notification_priority,
    bottom,
    tutorial,
  }: HealthWorkerHomePageSidebarProps,
) {
  return (
    <GenericSidebar
      route={route}
      params={params}
      urlSearchParams={urlSearchParams}
      nav_links={practitionerHomePageNavLinks({
        health_worker_notification_count,
        health_worker_notification_priority,
      })}
      top={<HealthWorkerDefaultTop />}
      bottom={bottom}
      tutorial={tutorial}
    />
  )
}
