import { loadDesktopDownloadsManifest } from '../utils/desktop-releases'

export const prerender = true

export async function GET() {
  return new Response(
    `${JSON.stringify(await loadDesktopDownloadsManifest(), null, 2)}\n`,
    {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'Content-Type': 'application/json; charset=utf-8'
      }
    }
  )
}
