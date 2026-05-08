// Auto-generated from /blog/*.md
// Do not edit manually - run `deno task compile:blog` to regenerate
// Embeddable version of /blog with no header/footer, for iframing into the marketing site.

import { BlogIndexContent } from '../components/library/layout/BlogIndex.tsx'

type BlogPostMeta = {
  title: string
  subtitle?: string
  author?: string
  author_image?: string
  slug: string
  date: string
  description: string
  tags: string[]
  word_count: number
  hero_image?: string
  wide_image?: string
}

const BLOG_POSTS: BlogPostMeta[] = [
  {
    title: 'Why we must reimagine care in Africa',
    subtitle: undefined,
    author: 'Dr. Sikhululiwe Ngwenya',
    author_image: '/blog/images/authors/skhu.png',
    slug: 'why-we-must-reimagine-care-in-africa',
    date: '2026/05/12',
    description:
      "A blog post from Chief Medical Officer Dr. Sikhululiwe Ngwenya exploring how Virtual Hospitals Africa's digital health system can reduce overwhelm for health workers",
    tags: ['medicine', 'africa'],
    word_count: 2413,
    hero_image: '/blog/images/why-we-must-reimagine-care-in-africa/skhu-portrait.jpg',
    wide_image: '/blog/images/why-we-must-reimagine-care-in-africa/skhu-wide.png',
  },
  {
    title: 'How Health Workers Can Love Their Devices',
    subtitle: 'Learning from Dr. Atul Gawande and letting practitioners focus on care',
    author: 'Will Weiss',
    author_image: '/blog/images/authors/will-weiss.png',
    slug: 'how-health-workers-can-love-their-devices',
    date: '2026/04/21',
    description:
      "A blog post from Chief Technology Officer Will Weiss exploring how Virtual Hospitals Africa's digital health system can reduce overwhelm for health workers",
    tags: ['ux design', 'medicine'],
    word_count: 1665,
    hero_image: '/blog/images/how-health-workers-can-love-their-devices/lindiwe-holding-tablet.png',
    wide_image: '/blog/images/how-health-workers-can-love-their-devices/lindiwe-holding-tablet-wide.png',
  },
]

export default function BlogEmbedPage() {
  return <BlogIndexContent posts={BLOG_POSTS} />
}
