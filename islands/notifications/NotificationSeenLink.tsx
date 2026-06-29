import { ComponentChildren } from 'preact'
import { markNotificationsSeen } from './markNotificationsSeen.ts'

export function NotificationSeenLink({
  notification_id,
  href,
  children,
  className,
}: {
  notification_id: string
  href: string
  children: ComponentChildren
  className?: string
}) {
  function markSeenOnActivate() {
    void markNotificationsSeen(notification_id, { keepalive: true })
  }

  function handleAuxClick(event: MouseEvent) {
    if (event.button !== 1) return
    markSeenOnActivate()
  }

  return (
    <a
      href={href}
      className={className}
      onClick={markSeenOnActivate}
      onAuxClick={handleAuxClick}
    >
      {children}
    </a>
  )
}
