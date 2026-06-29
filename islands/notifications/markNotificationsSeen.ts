import { NotificationSummaryMessage } from '../../types.ts'

export async function markNotificationsSeen(
  notification_ids: string | string[],
  { keepalive = false }: { keepalive?: boolean } = {},
): Promise<boolean> {
  const ids = Array.isArray(notification_ids) ? notification_ids : [notification_ids]
  if (!ids.length) return false

  try {
    const response = await fetch('/app/notifications/seen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_ids: ids }),
      keepalive,
    })
    if (!response.ok) return false

    const data = await response.json()
    if (!data?.ok) return false

    const detail: NotificationSummaryMessage = {
      type: 'notification_summary',
      unread_count: data.unread_count,
      highest_priority: data.highest_priority,
    }
    self.dispatchEvent(new CustomEvent('notification', { detail }))
    return true
  } catch {
    return false
  }
}
