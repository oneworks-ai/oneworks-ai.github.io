import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docsAppDir = resolve(rootDir, 'apps/docs')
const stagingDir = resolve(docsAppDir, 'src')

const ignoredDirectories = new Set([
  '.git',
  '.github',
  '.vitepress',
  'dist',
  'node_modules'
])

const ignoredFiles = new Set([
  '.DS_Store',
  'AGENTS.md'
])

const readmeFilePattern = /^README(?:\.[^.]+)?\.md$/i

const args = new Set(process.argv.slice(2))
const isDryRun = args.has('--dry-run')

if (args.has('--help')) {
  console.log(`
Usage: node scripts/prepare-docs-content.mjs [--dry-run]

Environment:
  ONEWORKS_DOCS_SOURCE_DIR  Direct path to the app .oo/docs content directory.
  ONEWORKS_APP_ROOT         Path to the app checkout; .oo/docs is read from it.

When neither variable is set, the script tries the current working directory
and the parent app checkout layout used by the app repository submodule.
`.trim())
  process.exit(0)
}

const sourceDir = await resolveDocsSourceDir()
const files = await collectContentFiles(sourceDir, sourceDir)

console.log(`[prepare-docs-content] source: ${formatPath(sourceDir)}`)
console.log(`[prepare-docs-content] staging: ${formatPath(stagingDir)}`)
console.log(`[prepare-docs-content] files: ${files.length}`)

if (isDryRun) {
  for (const file of files) {
    console.log(`[prepare-docs-content] would copy ${toSourceRelativePath(sourceDir, file)}`)
  }
  process.exit(0)
}

await rm(stagingDir, { force: true, recursive: true })
await mkdir(stagingDir, { recursive: true })
await cp(sourceDir, stagingDir, {
  filter: (sourcePath) => shouldCopyPath(sourceDir, sourcePath),
  recursive: true
})

console.log('[prepare-docs-content] ready')

async function resolveDocsSourceDir() {
  if (process.env.ONEWORKS_DOCS_SOURCE_DIR?.trim()) {
    return ensureReadableDirectory(resolve(process.cwd(), process.env.ONEWORKS_DOCS_SOURCE_DIR.trim()))
  }

  const candidateAppRoots = [
    process.env.ONEWORKS_APP_ROOT?.trim(),
    process.cwd(),
    resolve(rootDir, '..', '..')
  ].filter(Boolean)

  for (const appRoot of candidateAppRoots) {
    const candidate = resolve(process.cwd(), appRoot, '.oo/docs')
    if (await isDirectory(candidate)) {
      return ensureReadableDirectory(candidate)
    }
  }

  throw new Error(
    [
      'Unable to find app docs content.',
      'Set ONEWORKS_DOCS_SOURCE_DIR=/path/to/app/.oo/docs or ONEWORKS_APP_ROOT=/path/to/app.'
    ].join(' ')
  )
}

async function ensureReadableDirectory(directory) {
  if (!await isDirectory(directory)) {
    throw new Error(`Docs source directory does not exist: ${directory}`)
  }

  if (isSameOrInside(stagingDir, directory) || isSameOrInside(directory, docsAppDir)) {
    throw new Error(`Refusing to stage docs from the docs app itself: ${directory}`)
  }

  return directory
}

async function collectContentFiles(directory, root) {
  const entries = (await readdir(directory, { withFileTypes: true }))
    .sort((left, right) => left.name.localeCompare(right.name))
  const files = []

  for (const entry of entries) {
    const path = resolve(directory, entry.name)

    if (!shouldCopyPath(root, path)) {
      continue
    }

    if (entry.isDirectory()) {
      files.push(...await collectContentFiles(path, root))
      continue
    }

    if (entry.isFile()) {
      files.push(path)
    }
  }

  return files
}

function shouldCopyPath(root, path) {
  const relativePath = relative(root, path)
  if (!relativePath) {
    return true
  }

  const parts = relativePath.split(sep)
  if (parts.some((part) => ignoredDirectories.has(part))) {
    return false
  }

  const fileName = basename(path)
  if (ignoredFiles.has(fileName) || readmeFilePattern.test(fileName)) {
    return false
  }

  return true
}

async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

function isSameOrInside(path, possibleParent) {
  const relativePath = relative(possibleParent, path)
  return !relativePath || (!relativePath.startsWith('..') && !relativePath.startsWith(sep))
}

function formatPath(path) {
  return relative(process.cwd(), path) || '.'
}

function toSourceRelativePath(root, path) {
  return relative(root, path).split(sep).join('/')
}
