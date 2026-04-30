import type { ComponentChildren } from 'preact'

export type WidgetCardProps = {
  title: string
  subtitle?: string
  children: ComponentChildren
}

export default function WidgetCard({ title, subtitle, children }: WidgetCardProps) {
  return (
    <div class='rounded-md border border-gray-200 bg-white p-4 shadow-sm'>
      <div class='mb-3'>
        <div class='text-sm font-medium text-gray-700'>{title}</div>
        {subtitle ? <div class='text-xs text-gray-500'>{subtitle}</div> : null}
      </div>
      {children}
    </div>
  )
}
