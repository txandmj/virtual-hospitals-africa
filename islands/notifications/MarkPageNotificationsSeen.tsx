import { useEffect, useRef } from 'preact/hooks'
import { NotificationSummaryMessage } from '../../types.ts'

export function MarkPageNotificationsSeen(
  { notification_ids }: { notification_ids: string[] },
) {
  const ids = useRef(notification_ids)

  useEffect(() => {
    const notification_ids = ids.current
    if (!notification_ids.length) return

    async function markPageNotificationsSeen() {
      try {
        const response = await fetch('/app/notifications/seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_ids }),
        })
        if (!response.ok) return

        const data = await response.json()
        if (!data?.ok) return

        const detail: NotificationSummaryMessage = {
          type: 'notification_summary',
          unread_count: data.unread_count,
          highest_priority: data.highest_priority,
        }
        self.dispatchEvent(new CustomEvent('notification', { detail }))
      } catch {
        // Fail quietly; the page remains usable without updated counts.
      }
    }

    markPageNotificationsSeen()
  }, [])

  return null
}
