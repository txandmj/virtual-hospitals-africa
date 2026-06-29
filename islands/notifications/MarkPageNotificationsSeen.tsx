import { useEffect, useRef } from 'preact/hooks'
import { markNotificationsSeen } from './markNotificationsSeen.ts'

export function MarkPageNotificationsSeen(
  { notification_ids }: { notification_ids: string[] },
) {
  const ids = useRef(notification_ids)

  useEffect(() => {
    void markNotificationsSeen(ids.current)
  }, [])

  return null
}
