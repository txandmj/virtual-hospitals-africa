import { ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'
import { useSidebarCollapsed } from './useSidebarCollapsed.tsx'

export function SidebarNavItemAnchor(
  { href, active, children }: {
    href: string
    active: boolean
    children: ComponentChildren
  },
) {
  const collapsed = useSidebarCollapsed()
  return (
    <a
      href={href}
      className={cls(
        'hover:text-gray-900 hover:bg-gray-50 group flex items-center rounded-md py-2 text-sm leading-6 capitalize transition-all duration-200',
        collapsed.value ? 'px-0 justify-center' : 'px-2',
        active ? 'text-gray-900 bg-gray-50' : 'text-gray-700',
      )}
    >
      {children}
    </a>
  )
}
