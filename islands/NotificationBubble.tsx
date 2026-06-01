import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { type Priority, priorityColors } from '../shared/priorities.ts'
import cls from '../util/cls.ts'

export function NotificationBubble(props: { count: number; priority: Priority | null }) {
  const count = useSignal(props.count)
  const colors = priorityColors(props.priority)

  useEffect(() => {
    function listener() {
      count.value++
    }
    self.addEventListener('notification', listener)
    return () => {
      self.removeEventListener('notification', listener)
    }
  }, [])

  if (!count.value) return null

  return (
    <span
      className={cls(
        'count ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
      )}
    >
      {count.value > 99 ? '99+' : count.value}
    </span>
  )
}
