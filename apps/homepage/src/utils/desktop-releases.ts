import { execFileSync } from 'node:child_process'

export type DownloadArchitecture = 'arm64' | 'unknown' | 'x64'
export type DownloadChannel = 'alpha' | 'beta' | 'rc' | 'stable'
export type DownloadPlatform = 'linux' | 'mac' | 'windows'

export type DesktopReleaseAsset = {
  architecture: DownloadArchitecture
  downloadUrl: string
  format: string
  name: string
  platform: DownloadPlatform
  size: number
}

export type DesktopRelease = {
  assets: DesktopReleaseAsset[]
  channel: DownloadChannel
  detailUrl: string
  prerelease: boolean
  publishedAt: string
  releaseUrl: string
  slug: string
  tagName: string
  title: string
}

export type DesktopDownloadsManifest = {
  fallbackUrl: string
  generatedAt: string
  releases: DesktopRelease[]
  schemaVersion: 1
}

type GithubReleaseAsset = {
  browser_download_url?: unknown
  name?: unknown
  size?: unknown
}

type GithubRelease = {
  assets?: unknown
  draft?: unknown
  html_url?: unknown
  name?: unknown
  prerelease?: unknown
  published_at?: unknown
  tag_name?: unknown
}

export const githubReleasesUrl = 'https://github.com/oneworks-ai/app/releases'

const githubReleasesApiUrl = 'https://api.github.com/repos/oneworks-ai/app/releases?per_page=40'

const normalizeReleaseString = (value: unknown) => {
  return typeof value === 'string' ? value.trim() : ''
}

const getReleaseAssets = (release: GithubRelease) => {
  return Array.isArray(release.assets) ? release.assets as GithubReleaseAsset[] : []
}

const isDesktopRelease = (release: GithubRelease) => {
  const tagName = normalizeReleaseString(release.tag_name)
  return tagName.startsWith('pkg/oneworks-desktop/v') || tagName.startsWith('desktop-v')
}

const getAssetPlatform = (assetName: string): DownloadPlatform | undefined => {
  if (assetName.includes('-mac-')) {
    return 'mac'
  }
  if (assetName.includes('linux')) {
    return 'linux'
  }
  if (assetName.includes('win') || assetName.endsWith('.exe') || assetName.endsWith('.msi')) {
    return 'windows'
  }
  return undefined
}

const getAssetArchitecture = (assetName: string): DownloadArchitecture => {
  if (assetName.includes('arm64') || assetName.includes('aarch64')) {
    return 'arm64'
  }
  if (
    assetName.includes('x64') ||
    assetName.includes('x86_64') ||
    assetName.includes('amd64')
  ) {
    return 'x64'
  }
  return 'unknown'
}

const getAssetFormat = (assetName: string) => {
  if (assetName.endsWith('.tar.gz')) {
    return 'TAR.GZ'
  }
  const match = assetName.match(/\.([a-z0-9]+)$/i)
  return match?.[1]?.toUpperCase() ?? 'ASSET'
}

const shouldUseAsset = (asset: GithubReleaseAsset) => {
  const assetName = normalizeReleaseString(asset.name).toLowerCase()
  const downloadUrl = normalizeReleaseString(asset.browser_download_url)
  return assetName !== '' &&
    downloadUrl !== '' &&
    !assetName.endsWith('.blockmap') &&
    !assetName.endsWith('.yml') &&
    !assetName.endsWith('.plist')
}

const normalizeReleaseTitle = (release: GithubRelease) => {
  const rawName = normalizeReleaseString(release.name) || normalizeReleaseString(release.tag_name)
  return rawName.replace(/^pkg\/oneworks-desktop\/v/, '')
}

const getReleaseChannel = (release: GithubRelease): DownloadChannel => {
  const versionText = [
    normalizeReleaseString(release.name),
    normalizeReleaseString(release.tag_name)
  ].join(' ').toLowerCase()
  if (!release.prerelease) {
    return 'stable'
  }
  if (versionText.includes('beta')) {
    return 'beta'
  }
  if (versionText.includes('rc')) {
    return 'rc'
  }
  return 'alpha'
}

export const getDesktopReleasePath = (release: Pick<DesktopRelease, 'slug'>) => {
  return `/app/${encodeURIComponent(release.slug)}/`
}

const buildDesktopRelease = (release: GithubRelease): DesktopRelease | undefined => {
  const assets = getReleaseAssets(release).flatMap((asset): DesktopReleaseAsset[] => {
    if (!shouldUseAsset(asset)) {
      return []
    }

    const assetName = normalizeReleaseString(asset.name)
    const lowerAssetName = assetName.toLowerCase()
    const platform = getAssetPlatform(lowerAssetName)
    const downloadUrl = normalizeReleaseString(asset.browser_download_url)
    if (platform == null || downloadUrl === '') {
      return []
    }

    return [{
      architecture: getAssetArchitecture(lowerAssetName),
      downloadUrl,
      format: getAssetFormat(lowerAssetName),
      name: assetName,
      platform,
      size: typeof asset.size === 'number' ? asset.size : 0
    }]
  })

  if (assets.length === 0) {
    return undefined
  }

  const title = normalizeReleaseTitle(release)
  const slug = title
  return {
    assets,
    channel: getReleaseChannel(release),
    detailUrl: getDesktopReleasePath({ slug }),
    prerelease: release.prerelease === true,
    publishedAt: normalizeReleaseString(release.published_at),
    releaseUrl: normalizeReleaseString(release.html_url) || githubReleasesUrl,
    slug,
    tagName: normalizeReleaseString(release.tag_name),
    title
  }
}

const loadGithubReleaseDataFromCli = () => {
  try {
    const releaseData = execFileSync('gh', [
      'api',
      'repos/oneworks-ai/app/releases',
      '--paginate'
    ], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
    const parsedValue = JSON.parse(releaseData)
    return Array.isArray(parsedValue) ? parsedValue as GithubRelease[] : []
  } catch (error) {
    void error
    return []
  }
}

const normalizeDesktopReleases = (releaseData: GithubRelease[]) => {
  return releaseData
    .filter((release) => release.draft !== true && isDesktopRelease(release))
    .map(buildDesktopRelease)
    .filter((release): release is DesktopRelease => release != null)
}

const readNodeEnv = (key: string) => {
  const globalWithProcess = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> }
  }
  return globalWithProcess.process?.env?.[key]
}

export const loadDesktopReleases = async () => {
  try {
    const githubToken = import.meta.env.GITHUB_TOKEN ||
      import.meta.env.GH_TOKEN ||
      readNodeEnv('GITHUB_TOKEN') ||
      readNodeEnv('GH_TOKEN')
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
    if (typeof githubToken === 'string' && githubToken.trim() !== '') {
      headers.Authorization = `Bearer ${githubToken}`
    }
    const response = await fetch(githubReleasesApiUrl, {
      headers
    })
    if (!response.ok) {
      return normalizeDesktopReleases(loadGithubReleaseDataFromCli())
    }

    const releaseData = await response.json()
    if (!Array.isArray(releaseData)) {
      return []
    }

    return normalizeDesktopReleases(releaseData as GithubRelease[])
  } catch (error) {
    void error
    return normalizeDesktopReleases(loadGithubReleaseDataFromCli())
  }
}

export const loadDesktopDownloadsManifest = async (): Promise<DesktopDownloadsManifest> => {
  return {
    fallbackUrl: githubReleasesUrl,
    generatedAt: new Date().toISOString(),
    releases: await loadDesktopReleases(),
    schemaVersion: 1
  }
}
