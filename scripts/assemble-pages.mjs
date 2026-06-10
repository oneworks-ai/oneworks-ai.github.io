import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(rootDir, 'dist')
const homepageDistDir = resolve(rootDir, 'apps/homepage/dist')
const docsDistDir = resolve(rootDir, 'apps/docs/.vitepress/dist')

await rm(distDir, { force: true, recursive: true })
await mkdir(distDir, { recursive: true })

await cp(homepageDistDir, distDir, { recursive: true })
await mkdir(resolve(distDir, 'docs'), { recursive: true })
await cp(docsDistDir, resolve(distDir, 'docs'), { recursive: true })
await writeFile(resolve(distDir, '.nojekyll'), '')
