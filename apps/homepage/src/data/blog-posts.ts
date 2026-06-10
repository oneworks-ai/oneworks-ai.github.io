import aiNativeToolsCover from '../assets/blog-covers/ai-native-tools.png'

type ImageAsset = {
  src: string
}

const assetSrc = (asset: ImageAsset | string) => typeof asset === 'string' ? asset : asset.src

const coverAssets = {
  'ai-native-tools': {
    alt: '抽象插件节点、设计网格和工具面板组成的 AI 工具封面',
    src: assetSrc(aiNativeToolsCover)
  }
} as const

const rawBlogPosts = import.meta.glob<string>('../content/blog/*.md', {
  eager: true,
  import: 'default',
  query: '?raw'
})

export type BlogPostSection = {
  heading: string
  items?: string[]
  paragraphs?: string[]
}

export type BlogPostCover = {
  alt: string
  src: string
}

export type BlogPost = {
  author: string
  cover: BlogPostCover
  date: string
  datetime: string
  readTime: string
  sections: BlogPostSection[]
  slug: string
  summary: string
  title: string
}

type BlogFrontmatter = {
  author: string
  cover: keyof typeof coverAssets
  date: string
  datetime: string
  readTime: string
  slug: string
  summary: string
  title: string
}

function stripQuotes(value: string) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseFrontmatter(raw: string, filePath: string) {
  const normalized = raw.replace(/\r\n/g, '\n')
  if (!normalized.startsWith('---\n')) {
    throw new Error(`Blog post is missing frontmatter: ${filePath}`)
  }

  const endIndex = normalized.indexOf('\n---', 4)
  if (endIndex < 0) {
    throw new Error(`Blog post frontmatter is not closed: ${filePath}`)
  }

  const frontmatterText = normalized.slice(4, endIndex)
  const body = normalized.slice(endIndex + 4).trim()
  const frontmatter: Record<string, string> = {}

  for (const line of frontmatterText.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue
    }

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex < 0) {
      throw new Error(`Invalid blog frontmatter line in ${filePath}: ${line}`)
    }

    const key = trimmed.slice(0, colonIndex).trim()
    const value = stripQuotes(trimmed.slice(colonIndex + 1))
    frontmatter[key] = value
  }

  return { body, frontmatter }
}

function requireFrontmatterValue(frontmatter: Record<string, string>, key: keyof BlogFrontmatter, filePath: string) {
  const value = frontmatter[key]
  if (value == null || value.trim().length === 0) {
    throw new Error(`Blog post frontmatter is missing "${key}": ${filePath}`)
  }
  return value
}

function readFrontmatter(frontmatter: Record<string, string>, filePath: string): BlogFrontmatter {
  const cover = requireFrontmatterValue(frontmatter, 'cover', filePath)
  if (!(cover in coverAssets)) {
    throw new Error(`Blog post references an unknown cover "${cover}": ${filePath}`)
  }

  return {
    author: requireFrontmatterValue(frontmatter, 'author', filePath),
    cover: cover as keyof typeof coverAssets,
    date: requireFrontmatterValue(frontmatter, 'date', filePath),
    datetime: requireFrontmatterValue(frontmatter, 'datetime', filePath),
    readTime: requireFrontmatterValue(frontmatter, 'readTime', filePath),
    slug: requireFrontmatterValue(frontmatter, 'slug', filePath),
    summary: requireFrontmatterValue(frontmatter, 'summary', filePath),
    title: requireFrontmatterValue(frontmatter, 'title', filePath)
  }
}

function parseMarkdownSections(markdown: string): BlogPostSection[] {
  const sections: BlogPostSection[] = []
  let current: BlogPostSection | undefined
  let paragraphLines: string[] = []

  const flushParagraph = () => {
    if (current == null || paragraphLines.length === 0) {
      paragraphLines = []
      return
    }

    current.paragraphs = current.paragraphs ?? []
    current.paragraphs.push(paragraphLines.join(' '))
    paragraphLines = []
  }

  const ensureCurrentSection = () => {
    if (current == null) {
      current = { heading: '' }
      sections.push(current)
    }
    return current
  }

  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trim()

    if (line.startsWith('## ')) {
      flushParagraph()
      current = { heading: line.slice(3).trim() }
      sections.push(current)
      continue
    }

    if (line.length === 0) {
      flushParagraph()
      continue
    }

    if (line.startsWith('- ')) {
      flushParagraph()
      const section = ensureCurrentSection()
      section.items = section.items ?? []
      section.items.push(line.slice(2).trim())
      continue
    }

    paragraphLines.push(line)
  }

  flushParagraph()

  return sections.filter((section) => (
    section.heading.length > 0 ||
    (section.paragraphs?.length ?? 0) > 0 ||
    (section.items?.length ?? 0) > 0
  ))
}

function createBlogPost(filePath: string, raw: string): BlogPost {
  const { body, frontmatter } = parseFrontmatter(raw, filePath)
  const metadata = readFrontmatter(frontmatter, filePath)

  return {
    author: metadata.author,
    cover: coverAssets[metadata.cover],
    date: metadata.date,
    datetime: metadata.datetime,
    readTime: metadata.readTime,
    sections: parseMarkdownSections(body),
    slug: metadata.slug,
    summary: metadata.summary,
    title: metadata.title
  }
}

export const blogPosts: BlogPost[] = Object.entries(rawBlogPosts)
  .map(([filePath, raw]) => createBlogPost(filePath, raw))
  .sort((left, right) => right.datetime.localeCompare(left.datetime))

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}
