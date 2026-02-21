// Auto-generated from /blog/*.md
// Do not edit manually - run `deno task compile:blog` to regenerate

import LayoutBlogIndex from '../components/library/layout/BlogIndex.tsx'

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

const BLOG_POSTS: BlogPostMeta[] = [
  {
    title: 'Design Principles',
    subtitle: 'The foundations of everything we build',
    author: 'Will Weiss',
    slug: 'design-principles',
    date: '2026-02-20',
    description: 'Our core design principles for building healthcare technology',
    tags: ['tech', 'medicine'],
    word_count: 738,
  },
  {
    title: 'Building a Rules Engine',
    subtitle: 'Clinical decision support with S-expressions',
    author: undefined,
    slug: 'rules-engine',
    date: '2024-01-20',
    description: 'How we built our clinical decision support rules engine',
    tags: ['tech', 'medicine', 'analytics'],
    word_count: 80,
  },
]

export default function BlogIndexPage() {
  return <LayoutBlogIndex posts={BLOG_POSTS} />
}
