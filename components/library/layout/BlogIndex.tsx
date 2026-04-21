import cls from '../../../util/cls.ts'
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
  word_count: number
  hero_image?: string
}

export type LayoutBlogIndexProps = {
  posts: BlogPostMeta[]
  embed?: boolean
}

function formatDate(date_string: string): string {
  const date = new Date(date_string)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function Byline({ author, date, word_count }: { author?: string; date: string; word_count: number }) {
  return (
    <div className='flex flex-wrap items-center gap-x-3 text-xs uppercase tracking-widest text-slate-400 mb-3'>
      {author && <span>{author}</span>}
      {author && <span aria-hidden='true'>·</span>}
      <time>{formatDate(date)}</time>
      <span aria-hidden='true'>·</span>
      <span>{Math.ceil(word_count / 200)} min read</span>
    </div>
  )
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

function FeaturedArticle({ post }: { post: BlogPostMeta }) {
  return (
    <li className='border-b border-slate-200'>
      <a href={`/blog/${post.slug}`} className='group flex flex-col lg:flex-row hover:opacity-95 transition-opacity'>
        {post.hero_image && (
          <div className='lg:w-[58%] flex-shrink-0 overflow-hidden bg-slate-100' style='aspect-ratio: 3/2;'>
            <img
              src={`${post.hero_image}?w=900&auto=format&fit=crop&q=80`}
              alt={post.title}
              className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]'
            />
          </div>
        )}
        <div className='lg:w-[42%] p-8 lg:p-12 flex flex-col justify-center'>
          <Byline author={post.author} date={post.date} word_count={post.word_count} />
          <h2 className='font-serif text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-5'>{post.title}</h2>
          {post.subtitle && <p className='text-slate-500 text-base mb-4 leading-relaxed'>{post.subtitle}</p>}
          <p className='text-slate-600 text-base leading-relaxed'>{post.description}</p>
          <Tags tags={post.tags} />
        </div>
      </a>
    </li>
  )
}

function HalfArticle({ post, border_right }: { post: BlogPostMeta; border_right: boolean }) {
  return (
    <li className={border_right ? 'border-r border-slate-200' : ''}>
      <a href={`/blog/${post.slug}`} className='group block hover:opacity-95 transition-opacity h-full'>
        {post.hero_image && (
          <div className='overflow-hidden bg-slate-100' style='aspect-ratio: 3/2;'>
            <img
              src={`${post.hero_image}?w=600&auto=format&fit=crop&q=80`}
              alt={post.title}
              className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]'
            />
          </div>
        )}
        <div className='p-6 lg:p-8'>
          <Byline author={post.author} date={post.date} word_count={post.word_count} />
          <h2 className='text-xl font-semibold text-slate-900 leading-snug mb-3'>{post.title}</h2>
          {post.subtitle && <p className='text-slate-500 text-sm mb-2 leading-relaxed'>{post.subtitle}</p>}
          <p className='text-slate-600 text-sm leading-relaxed'>{post.description}</p>
          <Tags tags={post.tags} />
        </div>
      </a>
    </li>
  )
}

function TextOnlyArticle({ post }: { post: BlogPostMeta }) {
  return (
    <li className='border-b border-slate-200 last:border-b-0'>
      <a href={`/blog/${post.slug}`} className='group block py-6 px-2 hover:opacity-95 transition-opacity'>
        <Byline author={post.author} date={post.date} word_count={post.word_count} />
        <h2 className='text-lg font-semibold text-slate-900 mb-1 group-hover:text-[#473fce] transition-colors'>{post.title}</h2>
        {post.subtitle && <p className='text-slate-500 text-sm mb-1'>{post.subtitle}</p>}
        <p className='text-slate-600 text-sm leading-relaxed'>{post.description}</p>
        <Tags tags={post.tags} />
      </a>
    </li>
  )
}

export function BlogIndexContent({ posts, embed }: LayoutBlogIndexProps) {
  const [featured, ...rest] = posts
  const with_images = rest.filter((p) => p.hero_image)
  const text_only = rest.filter((p) => !p.hero_image)

  const pairs: BlogPostMeta[][] = []
  for (let i = 0; i < with_images.length; i += 2) {
    pairs.push(with_images.slice(i, i + 2))
  }

  return (
    <div className='mx-auto max-w-5xl px-6'>
      <div
        className={cls('py-8', {
          'border-b border-slate-200': !embed,
        })}
      >
        <p className='text-xs uppercase tracking-widest text-slate-400 font-medium'>Virtual Hospitals Africa</p>
        <h1 className='font-serif text-4xl font-bold text-slate-900 mt-1'>Blog</h1>
      </div>

      <ul>
        {featured && <FeaturedArticle post={featured} />}

        {pairs.map((pair, i) => (
          <li key={i} className={`border-b border-slate-200${i === 0 && featured ? ' pt-8' : ''}`}>
            <ul className='grid grid-cols-1 sm:grid-cols-2'>
              {pair.map((post, j) => <HalfArticle key={post.slug} post={post} border_right={j === 0 && pair.length === 2} />)}
            </ul>
          </li>
        ))}

        {text_only.length > 0 && (
          <li className={pairs.length === 0 && featured ? 'pt-8' : ''}>
            <ul className='divide-y divide-slate-200'>
              {text_only.map((post) => <TextOnlyArticle key={post.slug} post={post} />)}
            </ul>
          </li>
        )}
      </ul>
    </div>
  )
}

export default function LayoutBlogIndex({ posts }: LayoutBlogIndexProps) {
  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <BlogHeader />
      <main className='flex-1'>
        <BlogIndexContent posts={posts} />
      </main>
      <MarketingFooter />
    </div>
  )
}
