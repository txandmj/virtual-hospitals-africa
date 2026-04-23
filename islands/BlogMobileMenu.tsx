import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon } from '../components/library/icons/heroicons/outline.tsx'
import { NAV_ITEMS } from '../shared/navigation_items.ts'

export default function BlogMobileMenu() {
  return (
    <div className='relative md:hidden'>
      <Menu>
        <MenuButton
          className='flex items-center justify-center w-10 h-10 rounded cursor-pointer text-[#6f7788] hover:text-gray-900 focus:outline-none'
          aria-label='Open navigation menu'
        >
          <Bars3Icon className='w-6 h-6' />
        </MenuButton>
        <MenuItems className='absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in'>
          <div className='py-1'>
            {NAV_ITEMS.map((item) => (
              <MenuItem key={item.href}>
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  className={item.cta
                    ? 'block px-4 py-2 text-base font-medium text-[#473fce] data-[focus]:bg-gray-100 data-[focus]:outline-none'
                    : 'block px-4 py-2 text-base font-medium text-[#6f7788] data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none'}
                >
                  {item.text}
                </a>
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  )
}
