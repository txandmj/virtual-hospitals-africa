import { ComponentChildren } from 'preact'
import MarketingFooter from '../../MarketingFooter.tsx'
import BlogHeader from './BlogHeader.tsx'

type BlogPostMeta = {
  title: string
  subtitle?: string
  author?: string
  slug: string
  date: string
  description: string
  tags: string[]
  hero_image?: string
}

export type LayoutBlogPostProps = {
  title: string
  subtitle?: string
  author?: string
  author_image?: string
  date: string
  tags: string[]
  word_count: number
  hero_image?: string
  wide_image?: string
  other_posts: BlogPostMeta[]
  children: ComponentChildren
}

function formatDate(date_string: string): string {
  const date = new Date(date_string)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function Tags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null
  return (
    <div className='flex flex-wrap gap-2 mt-4'>
      {tags.map((tag) => (
        <span key={tag} className='px-2 py-0.5 text-xs uppercase tracking-wide font-medium border border-slate-200 text-slate-500 rounded'>
          {tag}
        </span>
      ))}
    </div>
  )
}

function CallToAction() {
  return (
    <aside className='mt-16 pt-8 border-t border-slate-200'>
      <div className='bg-slate-50 rounded-lg p-6 sm:p-8 border border-slate-100'>
        <h2 className='font-serif text-2xl font-bold text-slate-900'>Stay connected with Virtual Hospitals Africa</h2>
        <p className='text-slate-600 mt-2 leading-relaxed'>
          Get updates on our work.
        </p>
        <div className='mt-6'>
          <a
            href='/mailing-list'
            className='inline-flex items-center justify-center rounded-lg px-4 py-2 text-white font-medium bg-[#473fce] hover:bg-[#3a33a8] transition-colors'
          >
            Sign up for our mailing list
          </a>
        </div>
      </div>

      <a
        href='/tutorial'
        className='group mt-6 block rounded-lg overflow-hidden border border-slate-200 hover:border-[#473fce] transition-colors'
      >
        <div className='overflow-hidden bg-slate-100'>
          <img
            src='/images/ogimage-tutorial.png'
            alt='Try the tutorial'
            className='w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]'
          />
        </div>
        <div className='p-4 sm:p-6 flex items-center justify-between gap-4'>
          <div>
            <h2 className='font-serif text-2xl font-bold text-slate-900 group-hover:text-[#473fce] transition-colors'>Try the tutorial</h2>
            <p className='text-slate-600 mt-1 leading-relaxed'>See the platform in action.</p>
          </div>
          <span className='text-[#473fce] font-medium whitespace-nowrap'>Get started →</span>
        </div>
      </a>
    </aside>
  )
}

function OtherPosts({ posts }: { posts: BlogPostMeta[] }) {
  if (posts.length === 0) return null
  return (
    <aside className='mt-16 pt-8 border-t border-slate-200'>
      <h2 className='text-xs uppercase tracking-widest text-slate-400 font-medium mb-6'>More Posts</h2>
      <ul className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        {posts.map((post) => (
          <li key={post.slug} className='border border-slate-100 rounded overflow-hidden'>
            <a href={`/blog/${post.slug}`} className='group block hover:opacity-95 transition-opacity'>
              {post.hero_image && (
                <div className='overflow-hidden bg-slate-100' style='aspect-ratio: 3/2;'>
                  <img
                    src={`${post.hero_image}?w=500&auto=format&fit=crop&q=80`}
                    alt={post.title}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]'
                  />
                </div>
              )}
              <div className='p-4'>
                {post.author && <p className='text-xs uppercase tracking-widest text-slate-400 mb-1'>{post.author}</p>}
                <h3 className='text-base font-semibold text-slate-900 group-hover:text-[#473fce] transition-colors'>{post.title}</h3>
                <p className='text-sm text-slate-500 mt-1 leading-relaxed'>{post.description}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default function LayoutBlogPost(
  { title, subtitle, author, author_image, date, tags, word_count, hero_image, wide_image, other_posts, children }: LayoutBlogPostProps,
) {
  const banner_image = wide_image ?? hero_image
  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <BlogHeader />
      <main className='flex-1'>
        <article>
          {banner_image && (
            <div className='w-full bg-slate-100'>
              <img src={`${banner_image}?w=1600&auto=format&q=80`} alt={title} className='w-full h-auto' />
            </div>
          )}

          <div className='mx-auto max-w-3xl px-6 py-12'>
            <header className='mb-10'>
              <div className='flex items-center gap-3 mb-4'>
                {author_image && (
                  <img
                    src={author_image}
                    alt={author ?? ''}
                    className='w-10 h-10 rounded-full object-cover bg-slate-100'
                  />
                )}
                <div className='flex flex-wrap items-center gap-x-3 text-xs uppercase tracking-widest text-slate-400'>
                  <div className='flex flex-col'>
                    {author && <strong>{author}</strong>}
                    <time>{formatDate(date)}</time>

                  </div>
                  {author && <span aria-hidden='true'>·</span>}
                  <span aria-hidden='true'>·</span>
                  <span>{Math.ceil(word_count / 200)} min read</span>
                </div>
              </div>
              <h1 className='font-serif text-4xl lg:text-5xl font-bold text-slate-900 leading-tight'>{title}</h1>
              {subtitle && <p className='text-xl text-slate-500 mt-4 leading-relaxed'>{subtitle}</p>}
              <Tags tags={tags} />
            </header>

            <div className='prose prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-[#473fce] prose-a:no-underline hover:prose-a:underline'>
              {children}
            </div>

            <CallToAction />

            <OtherPosts posts={other_posts} />
          </div>
        </article>
      </main>

      <MarketingFooter />
    </div>
  )
}
