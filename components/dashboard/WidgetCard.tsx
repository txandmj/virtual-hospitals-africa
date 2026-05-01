import type { ComponentChildren } from 'preact'

export type WidgetCardProps = {
  title: string
  subtitle?: string
  children: ComponentChildren
}

export default function WidgetCard({ title, subtitle, children }: WidgetCardProps) {
  return (
    <div class='rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'>
      <div class='mb-4'>
        <div class='text-base font-semibold tracking-tight text-gray-900'>{title}</div>
        {subtitle ? <div class='mt-0.5 text-xs text-gray-500'>{subtitle}</div> : null}
      </div>
      {children}
    </div>
  )
}
