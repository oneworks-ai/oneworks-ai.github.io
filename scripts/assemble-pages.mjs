import { cp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(rootDir, 'dist')
const homepageDistDir = resolve(rootDir, 'apps/homepage/dist')
const docsDistDir = resolve(rootDir, 'apps/docs/.vitepress/dist')
const siteUrl = process.env.ONEWORKS_SITE_URL?.trim() ||
  process.env.PUBLIC_ONEWORKS_SITE_URL?.trim() ||
  'https://oneworks.cloud'
const normalizedSiteUrl = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const collectHtmlFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      return collectHtmlFiles(entryPath)
    }
    return entry.name.endsWith('.html') ? [entryPath] : []
  }))
  return files.flat()
}

const getUrlPath = (filePath) => {
  const relativePath = relative(distDir, filePath).split(sep).join('/')
  if (relativePath === 'index.html') {
    return '/'
  }
  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.slice(0, -'index.html'.length)}`
  }
  if (relativePath.endsWith('.html')) {
    return `/${relativePath.slice(0, -'.html'.length)}`
  }
  return `/${relativePath}`
}

const getChangeFrequency = (urlPath) => {
  if (urlPath === '/' || urlPath.startsWith('/app/')) {
    return 'weekly'
  }
  if (urlPath.startsWith('/docs/')) {
    return 'weekly'
  }
  return 'monthly'
}

const getPriority = (urlPath) => {
  if (urlPath === '/') {
    return '1.0'
  }
  if (urlPath === '/app/' || urlPath === '/blog/' || urlPath === '/docs/') {
    return '0.8'
  }
  if (urlPath.startsWith('/docs/') || urlPath.startsWith('/app/')) {
    return '0.7'
  }
  return '0.6'
}

const writeSeoFiles = async () => {
  const seenPaths = new Set()
  const sitemapEntries = []
  const htmlFiles = await collectHtmlFiles(distDir)

  for (const filePath of htmlFiles) {
    const urlPath = getUrlPath(filePath)
    if (
      seenPaths.has(urlPath) ||
      urlPath === '/404' ||
      urlPath.endsWith('/404')
    ) {
      continue
    }

    seenPaths.add(urlPath)
    const fileStat = await stat(filePath)
    sitemapEntries.push({
      changefreq: getChangeFrequency(urlPath),
      lastmod: fileStat.mtime.toISOString().slice(0, 10),
      loc: new URL(urlPath, normalizedSiteUrl).toString(),
      priority: getPriority(urlPath)
    })
  }

  sitemapEntries.sort((left, right) => left.loc.localeCompare(right.loc))

  const sitemapBody = sitemapEntries.map((entry) => [
    '  <url>',
    `    <loc>${escapeXml(entry.loc)}</loc>`,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>'
  ].join('\n')).join('\n')
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    sitemapBody,
    '</urlset>'
  ].join('\n')
  await writeFile(resolve(distDir, 'sitemap.xml'), `${sitemap}\n`)

  const robots = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${new URL('/sitemap.xml', normalizedSiteUrl).toString()}`
  ].join('\n')
  await writeFile(resolve(distDir, 'robots.txt'), `${robots}\n`)
}

await rm(distDir, { force: true, recursive: true })
await mkdir(distDir, { recursive: true })

await cp(homepageDistDir, distDir, { recursive: true })
await mkdir(resolve(distDir, 'docs'), { recursive: true })
await cp(docsDistDir, resolve(distDir, 'docs'), { recursive: true })
await writeFile(resolve(distDir, '.nojekyll'), '')
await writeSeoFiles()
