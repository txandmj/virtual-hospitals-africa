import { ComponentChildren } from 'preact'
import MarketingFooter from '../MarketingFooter.tsx'
import MarketingHeader from './layout/MarketingHeader.tsx'

export default function MarketingLayout({
  children,
  url,
  title,
}: {
  children: ComponentChildren
  url: URL
  title: string
}) {
  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <title>{title}</title>
      <MarketingHeader url={url} />
      <main className='flex-1'>
        {children}
      </main>
      <MarketingFooter />
    </div>
  )
}
