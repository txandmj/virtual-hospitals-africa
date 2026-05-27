import { ComponentChild, ComponentChildren } from 'preact'
import type { RenderedEmployee } from '../../../types.ts'
import HealthWorkerContentsWithSidebarAndDrawer from './HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { HealthWorkerSidebarBottom } from '../HealthWorkerSidebarBottom.tsx'
import { HealthWorkerHomePageSidebar } from '../sidebar/HealthWorkerHomePage.tsx'

/**
 * Standalone layout component for health worker home pages.
 * Used by tutorial and other contexts that don't have a LoggedInHealthWorkerContext.
 */
export function HealthWorkerHomePageLayout({
  title,
  url,
  route,
  params,
  employee,
  drawer,
  tutorial,
  health_worker_notification_count = 0,
  children,
}: {
  title: string
  url: URL
  route: string
  params: Record<string, string>
  employee: RenderedEmployee
  drawer?: ComponentChild
  tutorial?: boolean
  health_worker_notification_count?: number
  children: ComponentChildren
}) {
  return (
    <HealthWorkerContentsWithSidebarAndDrawer
      title={title}
      url={url}
      sidebar={
        <HealthWorkerHomePageSidebar
          route={route}
          params={params}
          urlSearchParams={url.searchParams}
          health_worker_notification_count={health_worker_notification_count}
          bottom={<HealthWorkerSidebarBottom employee={employee} />}
          tutorial={tutorial}
        />
      }
      drawer={drawer}
    >
      <div className='px-4'>{children}</div>
    </HealthWorkerContentsWithSidebarAndDrawer>
  )
}
