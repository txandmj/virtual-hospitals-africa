import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import type { Priority } from '../shared/priorities.ts'

export function NotificationBubble(props: { count: number; priority: Priority | null }) {
  const count = useSignal(props.count)

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
    <span className='count ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-medium'>
      {count.value > 99 ? '99+' : count.value}
    </span>
  )
}
