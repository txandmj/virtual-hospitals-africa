import type { ComponentChildren } from 'preact'

export type FilterBarProps = {
  action: string
  children: ComponentChildren
}

export default function FilterBar({ action, children }: FilterBarProps) {
  return (
    <form
      method='get'
      action={action}
      class='flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-3'
    >
      {children}
      <button
        type='submit'
        class='rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-700'
      >
        Apply
      </button>
    </form>
  )
}
