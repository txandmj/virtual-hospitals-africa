import { ComponentChildren } from 'preact'
import { FullFooter } from '../../landing-page/Footer.tsx'

type BlogPostMeta = {
  title: string
  subtitle?: string
  author?: string
  slug: string
  date: string
  description: string
  tags: string[]
}

export type LayoutBlogPostProps = {
  title: string
  subtitle?: string
  author?: string
  date: string
  tags: string[]
  word_count: number
  other_posts: BlogPostMeta[]
  children: ComponentChildren
}

function BlogHeader() {
  return (
    <header className='bg-white border-b border-slate-200'>
      <div className='mx-auto max-w-3xl px-6 py-6'>
        <a href='/' className='flex items-center gap-3'>
          <img src='/images/logo.svg' alt='Virtual Hospitals Africa' className='h-8 w-8' />
          <span className='text-lg font-semibold text-slate-900'>Virtual Hospitals Africa</span>
        </a>
      </div>
    </header>
  )
}

function formatDate(date_string: string): string {
  const date = new Date(date_string)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function Tags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null
  return (
    <div className='flex flex-wrap gap-2'>
      {tags.map((tag) => (
        <span key={tag} className='px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded'>
          {tag}
        </span>
      ))}
    </div>
  )
}

function OtherPosts({ posts }: { posts: BlogPostMeta[] }) {
  if (posts.length === 0) return null

  return (
    <aside className='mt-16 border-t border-slate-200 pt-8'>
      <h2 className='text-lg font-semibold text-slate-900 mb-4'>Other Posts</h2>
      <ul className='space-y-4'>
        {posts.map((post) => (
          <li key={post.slug}>
            <a href={`/blog/${post.slug}`} className='group block'>
              <h3 className='text-base font-medium text-blue-600 group-hover:text-blue-800'>{post.title}</h3>
              <p className='text-sm text-slate-600 mt-1'>{post.description}</p>
              <time className='text-xs text-slate-500'>{formatDate(post.date)}</time>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default function LayoutBlogPost({ title, subtitle, author, date, tags, word_count, other_posts, children }: LayoutBlogPostProps) {
  return (
    <div className='min-h-screen flex flex-col'>
      <BlogHeader />
      <main className='flex-1'>
        <article className='mx-auto max-w-3xl px-6 py-12'>
          <header className='mb-8'>
            <h1 className='text-3xl font-bold text-slate-900'>{title}</h1>
            {subtitle && <p className='text-xl text-slate-600 mt-2'>{subtitle}</p>}
            <div className='flex flex-wrap items-center gap-x-4 gap-y-2 mt-3'>
              {author && <span className='text-sm font-medium text-slate-700'>{author}</span>}
              <time className='text-sm text-slate-500'>{formatDate(date)}</time>
              <span className='text-sm text-slate-500'>{Math.ceil(word_count / 200)} min read</span>
              <Tags tags={tags} />
            </div>
          </header>
          <div className='prose prose-slate max-w-none'>{children}</div>
          <OtherPosts posts={other_posts} />
        </article>
      </main>
      <FullFooter />
    </div>
  )
}
