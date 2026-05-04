type NavItem = {
  href: string
  text: string
  cta?: boolean
}

export const NORMAL_NAV_ITEMS: NavItem[] = [
  { href: '/', text: 'Home' },
  { href: '/tutorial', text: 'Try it out' },
  { href: 'https://virtualhospitalsafrica.org/team', text: 'Team' },
  { href: '/blog', text: 'Blog' },
  { href: '/donate', text: 'Donate' },
]

export const NAV_ITEMS: NavItem[] = [
  {
    href: 'https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa',
    text: 'GitHub',
  },
  { href: '/contact-general-inquiry', text: 'Get in Touch', cta: true },
]
