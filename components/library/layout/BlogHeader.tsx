import { LogoWithCollapsibleText } from '../../../islands/Logo.tsx'

function GitHubIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 40 40' width='100%' height='100%' role='presentation'>
      <g clipPath='url(#gh-clip-blog-header)'>
        <path
          d='M20.0246 8C13.3607 8 8 13.5 8 20.3C8 25.75 11.4426 30.35 16.2131 31.975C16.8033 32.1 17.0246 31.7 17.0246 31.375C17.0246 31.1 17 30.1 17 29.1C13.6557 29.825 12.9672 27.625 12.9672 27.625C12.4262 26.2 11.6393 25.825 11.6393 25.825C10.5574 25.075 11.7131 25.075 11.7131 25.075C12.918 25.15 13.5574 26.35 13.5574 26.35C14.6393 28.225 16.3607 27.7 17.0492 27.375C17.1475 26.575 17.4672 26.025 17.8115 25.725C15.1557 25.45 12.3525 24.375 12.3525 19.65C12.3525 18.3 12.8197 17.2 13.582 16.35C13.459 16.05 13.041 14.775 13.7049 13.1C13.7049 13.1 14.7131 12.775 17 14.375C17.959 14.1 18.9918 13.975 20 13.975C21.0082 13.975 22.041 14.125 23 14.375C25.2869 12.775 26.2951 13.1 26.2951 13.1C26.959 14.8 26.541 16.05 26.418 16.35C27.2049 17.2 27.6475 18.3 27.6475 19.65C27.6475 24.375 24.8443 25.425 22.1639 25.725C22.6066 26.1 22.9754 26.85 22.9754 28C22.9754 29.65 22.9508 30.975 22.9508 31.375C22.9508 31.7 23.1721 32.1 23.7623 31.975C28.5574 30.35 32 25.75 32 20.3C32.0246 13.5 26.6393 8 20.0246 8Z'
          fill='#1B1F24'
        />
      </g>
      <defs>
        <clipPath id='gh-clip-blog-header'>
          <rect fill='white' height='24' transform='translate(8 8)' width='24' />
        </clipPath>
      </defs>
    </svg>
  )
}

function NavLink({ href, text }: { href: string; text: string }) {
  return (
    <a href={href} className='h-12 flex justify-center items-center px-2 rounded cursor-pointer text-base font-medium whitespace-nowrap text-[#6f7788]'>
      {text}
    </a>
  )
}

export default function BlogHeader() {
  return (
    <header className='w-full bg-white border-b border-slate-100'>
      <div className='flex justify-between items-center px-6 relative' style='height: 64px;'>
        <a href='https://virtualhospitalsafrica.org' className='flex items-center h-full cursor-pointer'>
          <LogoWithCollapsibleText variant='indigo' />
        </a>

        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4'>
          <NavLink href='/' text='Home' />
          <NavLink href='/tutorial' text='Try it out' />
          <NavLink href='https://virtualhospitalsafrica.org/team' text='Team' />
          <a href='/blog' className='h-12 flex justify-center items-center px-2 rounded cursor-pointer text-base font-medium whitespace-nowrap text-[#29313d]'>
            Blog
          </a>
        </div>

        <div className='flex items-center gap-2'>
          <a
            href='https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa'
            target='_blank'
            className='relative block cursor-pointer'
            style='width: 40px; height: 40px;'
          >
            <div className='absolute inset-0'>
              <GitHubIcon />
            </div>
          </a>
          <a
            href='/contact-general-inquiry'
            className='flex items-center justify-center rounded-lg px-3 cursor-pointer text-white font-medium text-base whitespace-nowrap bg-[#473fce]'
            style='min-width: 80px; height: 40px;'
          >
            Get in Touch
          </a>
        </div>
      </div>
    </header>
  )
}
