import { assertEquals } from 'std/assert/assert_equals.ts'
import { SidebarNavItemText } from '../../../islands/sidebar/NavItemText.tsx'
import { SidebarNavItemAnchor } from '../../../islands/sidebar/NavItemAnchor.tsx'
import { LinkProps } from '../../../types.ts'
import { hyphenate } from '../../../util/hyphenate.ts'
import { NotificationBubble } from '../../../islands/NotificationBubble.tsx'

export function NavItem({
  href,
  title,
  active,
  count,
  notification_priority,
  Icon,
}: LinkProps) {
  if (typeof count === 'number') {
    assertEquals(title, 'Notifications')
  }
  return (
    <li id={`sidebar-list-item-${hyphenate(title)}`}>
      <SidebarNavItemAnchor href={href} active={!!active}>
        {Icon && <Icon className='w-5' active={active} />}
        <SidebarNavItemText>{title}</SidebarNavItemText>
        {typeof count === 'number' && <NotificationBubble count={count} priority={notification_priority ?? null} />}
      </SidebarNavItemAnchor>
    </li>
  )
}
