import { Menu } from '@headlessui/react'
import { Bars3Icon } from '../components/library/icons/heroicons/outline.tsx'

type NavItem = {
  href: string
  text: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', text: 'Home' },
  { href: '/tutorial', text: 'Try it out' },
  { href: 'https://virtualhospitalsafrica.org/team', text: 'Team' },
  { href: '/blog', text: 'Blog' },
  {
    href: 'https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa',
    text: 'GitHub',
  },
]

export default function BlogMobileMenu() {
  return (
    <Menu as='div' className='relative md:hidden'>
      <Menu.Button
        className='flex items-center justify-center w-10 h-10 rounded cursor-pointer text-[#6f7788] hover:text-gray-900'
        aria-label='Open navigation menu'
      >
        <Bars3Icon className='w-6 h-6' />
      </Menu.Button>
      <Menu.Items className='absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in'>
        <div className='py-1'>
          {NAV_ITEMS.map((item) => (
            <Menu.Item key={item.href}>
              <a
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                className='block px-4 py-2 text-base font-medium text-[#6f7788] data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none'
              >
                {item.text}
              </a>
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  )
}
