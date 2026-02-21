import { FullFooter } from '../../landing-page/Footer.tsx'

type BlogPostMeta = {
  title: string
  subtitle?: string
  author?: string
  slug: string
  date: string
  description: string
  tags: string[]
  word_count: number
}

export type LayoutBlogIndexProps = {
  posts: BlogPostMeta[]
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
    <div className='flex flex-wrap gap-2 mt-2'>
      {tags.map((tag) => (
        <span key={tag} className='px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded'>
          {tag}
        </span>
      ))}
    </div>
  )
}

export default function LayoutBlogIndex({ posts }: LayoutBlogIndexProps) {
  return (
    <div className='min-h-screen flex flex-col'>
      <BlogHeader />
      <main className='flex-1'>
        <div className='mx-auto max-w-3xl px-6 py-12'>
          <h1 className='text-3xl font-bold text-slate-900 mb-8'>Blog</h1>
          <ul className='space-y-8'>
            {posts.map((post) => (
              <li key={post.slug}>
                <a href={`/blog/${post.slug}`} className='group block'>
                  <article>
                    <h2 className='text-xl font-semibold text-blue-600 group-hover:text-blue-800'>{post.title}</h2>
                    {post.subtitle && <p className='text-lg text-slate-500 mt-1'>{post.subtitle}</p>}
                    <p className='text-slate-600 mt-2'>{post.description}</p>
                    <div className='flex flex-wrap items-center gap-x-4 gap-y-2 mt-2'>
                      {post.author && <span className='text-sm font-medium text-slate-700'>{post.author}</span>}
                      <time className='text-sm text-slate-500'>{formatDate(post.date)}</time>
                      <span className='text-sm text-slate-500'>{Math.ceil(post.word_count / 200)} min read</span>
                      <Tags tags={post.tags} />
                    </div>
                  </article>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <FullFooter />
    </div>
  )
}
