import { walk } from 'std/fs/mod.ts'
import { marked } from 'marked'
import { assert } from 'std/assert/assert.ts'

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

type BlogPost = BlogPostMeta & {
  html: string
}

/**
 * Parse frontmatter from markdown content
 * Returns the frontmatter object and the remaining content
 */
function parseFrontmatter(content: string): { meta: BlogPostMeta; body: string } {
  const frontmatter_match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!frontmatter_match) {
    throw new Error('Invalid frontmatter format')
  }

  const [, frontmatter_str, body] = frontmatter_match
  const meta: Record<string, string> = {}

  for (const line of frontmatter_str.split('\n')) {
    const colon_index = line.indexOf(':')
    if (colon_index > 0) {
      const key = line.slice(0, colon_index).trim()
      const value = line.slice(colon_index + 1).trim()
      meta[key] = value
    }
  }

  assert(meta.title, 'Missing title in frontmatter')
  assert(meta.slug, 'Missing slug in frontmatter')
  assert(meta.date, 'Missing date in frontmatter')
  assert(meta.description, 'Missing description in frontmatter')

  // Parse tags as comma-separated list
  const tags = meta.tags ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  const word_count = body.trim().split(/\s+/).filter(Boolean).length

  return {
    meta: {
      title: meta.title,
      subtitle: meta.subtitle,
      author: meta.author,
      slug: meta.slug,
      date: meta.date,
      description: meta.description,
      tags,
      word_count,
    } as BlogPostMeta,
    body,
  }
}

/**
 * Process a single markdown file and return blog post data
 */
async function processBlogPost(file_path: string): Promise<BlogPost> {
  console.log(`Processing ${file_path}...`)

  const content = await Deno.readTextFile(file_path)
  const { meta, body } = parseFrontmatter(content)
  const html = await marked(body)

  return {
    ...meta,
    html,
  }
}

/**
 * Escape a string for use in single-quoted TypeScript
 */
function escapeForSingleQuotes(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
}

/**
 * Format a blog post as TypeScript object literal with single quotes
 */
function formatPostAsTypescript(post: BlogPost): string {
  const tags_ts = post.tags.map((t) => `'${escapeForSingleQuotes(t)}'`).join(', ')
  const subtitle_ts = post.subtitle ? `'${escapeForSingleQuotes(post.subtitle)}'` : 'undefined'
  const author_ts = post.author ? `'${escapeForSingleQuotes(post.author)}'` : 'undefined'
  return `  {
    title: '${escapeForSingleQuotes(post.title)}',
    subtitle: ${subtitle_ts},
    author: ${author_ts},
    slug: '${escapeForSingleQuotes(post.slug)}',
    date: '${escapeForSingleQuotes(post.date)}',
    description: '${escapeForSingleQuotes(post.description)}',
    tags: [${tags_ts}],
    word_count: ${post.word_count},
    html: '${escapeForSingleQuotes(post.html)}',
  }`
}

/**
 * Format a blog post meta as TypeScript object literal (no html)
 */
function formatPostMetaAsTypescript(post: BlogPostMeta): string {
  const tags_ts = post.tags.map((t) => `'${escapeForSingleQuotes(t)}'`).join(', ')
  const subtitle_ts = post.subtitle ? `'${escapeForSingleQuotes(post.subtitle)}'` : 'undefined'
  const author_ts = post.author ? `'${escapeForSingleQuotes(post.author)}'` : 'undefined'
  return `  {
    title: '${escapeForSingleQuotes(post.title)}',
    subtitle: ${subtitle_ts},
    author: ${author_ts},
    slug: '${escapeForSingleQuotes(post.slug)}',
    date: '${escapeForSingleQuotes(post.date)}',
    description: '${escapeForSingleQuotes(post.description)}',
    tags: [${tags_ts}],
    word_count: ${post.word_count},
  }`
}

/**
 * Generate the blog index page content
 */
function generateIndexFile(posts: BlogPost[]): string {
  const posts_ts = posts.map(formatPostMetaAsTypescript).join(',\n')

  return `// Auto-generated from /blog/*.md
// Do not edit manually - run \`deno task compile:blog\` to regenerate

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
${posts_ts},
]

export default function BlogIndexPage() {
  return <LayoutBlogIndex posts={BLOG_POSTS} />
}
`
}

/**
 * Generate the route file content
 */
function generateRouteFile(posts: BlogPost[]): string {
  const posts_ts = posts.map(formatPostAsTypescript).join(',\n')

  return `// Auto-generated from /blog/*.md
// Do not edit manually - run \`deno task compile:blog\` to regenerate

import { Context } from 'fresh'
import LayoutBlogPost from '../../components/library/layout/Blog.tsx'

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

type BlogPost = BlogPostMeta & {
  html: string
}

const BLOG_POSTS: BlogPost[] = [
${posts_ts},
]

const POSTS_BY_SLUG = new Map(BLOG_POSTS.map((post) => [post.slug, post]))

export default function BlogPostPage(ctx: Context<unknown>) {
  const { post: slug } = ctx.params
  const post = POSTS_BY_SLUG.get(slug)

  if (!post) {
    return ctx.render(<div>Post not found</div>, { status: 404 })
  }

  const other_posts = BLOG_POSTS.filter((p) => p.slug !== slug)

  // deno-lint-ignore react-no-danger
  const html_content = <div dangerouslySetInnerHTML={{ __html: post.html }} />

  return (
    <LayoutBlogPost title={post.title} subtitle={post.subtitle} author={post.author} date={post.date} tags={post.tags} word_count={post.word_count} other_posts={other_posts}>
      {html_content}
    </LayoutBlogPost>
  )
}
`
}

/**
 * Main function - process all markdown files in /blog directory
 */
async function main() {
  const blog_dir = 'blog'
  const post_route_path = 'routes/blog/[post].tsx'
  const index_route_path = 'routes/blog.tsx'

  const posts: BlogPost[] = []

  for await (const entry of walk(blog_dir, { exts: ['.md'] })) {
    if (entry.isFile) {
      const post = await processBlogPost(entry.path)
      posts.push(post)
    }
  }

  if (posts.length === 0) {
    throw new Error(`No markdown files found in ${blog_dir}`)
  }

  // Sort posts by date, newest first
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Ensure the routes/blog directory exists
  await Deno.mkdir('routes/blog', { recursive: true })

  // Generate the route files
  const post_route_content = generateRouteFile(posts)
  await Deno.writeTextFile(post_route_path, post_route_content)

  const index_route_content = generateIndexFile(posts)
  await Deno.writeTextFile(index_route_path, index_route_content)

  // Format the generated files
  const fmt_command = new Deno.Command('deno', {
    args: ['fmt', post_route_path, index_route_path],
    stdout: 'inherit',
    stderr: 'inherit',
  })
  const fmt_result = await fmt_command.output()
  if (!fmt_result.success) {
    throw new Error('Failed to format generated files')
  }

  console.log(`\n✓ Generated ${post_route_path} and ${index_route_path} with ${posts.length} post(s)`)
  console.log('Posts:')
  for (const post of posts) {
    console.log(`  - ${post.title} (${post.slug})`)
  }
}

if (import.meta.main) {
  main()
}
