import { LogoWithFullText } from './library/Logo.tsx'

function GitHubIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' className='h-6 w-6'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.54.12-3.2 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.89.12 3.2.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.7.83.58C20.56 22.29 24 17.79 24 12.5 24 5.87 18.63.5 12 .5Z'
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true' className='h-6 w-6'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 1 1-.003-3.096 1.548 1.548 0 0 1 .003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z'
      />
    </svg>
  )
}

const primary_links = [
  { href: '/', text: 'Home' },
  { href: '/team', text: 'Team' },
  {
    href: 'https://www.idealist.org/en/nonprofit/318fda9457534eafa3fa691bba19f5ae-virtual-hospitals-africa-polokwane#opportunities',
    text: 'Careers',
    external: true,
  },
  { href: '/contact-general-inquiry', text: 'Contact' },
]

const legal_links = [
  { href: '/privacy-policy', text: 'Privacy Policy' },
  { href: '/terms-of-service', text: 'Terms of Service' },
]

function FooterLink({ href, text, external }: { href: string; text: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : '_self'}
      className='text-base font-medium leading-6 text-[#c8c6f7] hover:text-white whitespace-nowrap'
    >
      {text}
    </a>
  )
}

export default function MarketingFooter() {
  return (
    <footer className='w-full bg-[#2f2a89]'>
      <div className='mx-auto w-full max-w-[1200px] px-6 py-20 flex flex-col gap-20'>
        <div className='flex flex-col gap-10 lg:flex-row lg:justify-between lg:items-start'>
          <a href='/' aria-label='VHA logo' className='block' style='width: 170.667px'>
            <LogoWithFullText variant='white' className='w-full h-auto' />
          </a>
          <div className='flex flex-col gap-10 sm:flex-row sm:gap-20'>
            <div className='flex flex-col gap-4 sm:w-[120px]'>
              {primary_links.map((link) => <FooterLink key={link.text} {...link} />)}
            </div>
            <div className='flex flex-col gap-4 sm:w-[120px]'>
              {legal_links.map((link) => <FooterLink key={link.text} {...link} />)}
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center'>
          <p className='text-base text-white'>&copy; {new Date().getFullYear()} Virtual Hospitals Africa</p>
          <div className='flex items-center gap-4'>
            <a
              href='https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa'
              target='_blank'
              aria-label='Open GitHub'
              className='text-white hover:text-[#c8c6f7]'
            >
              <GitHubIcon />
            </a>
            <a
              href='https://www.linkedin.com/company/virtual-hospitals-africa/'
              target='_blank'
              aria-label='Open LinkedIn'
              className='text-white hover:text-[#c8c6f7]'
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
