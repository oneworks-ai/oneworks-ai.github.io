/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GH_TOKEN?: string
  readonly GITHUB_TOKEN?: string
  readonly PUBLIC_DOCS_URL?: string
  readonly PUBLIC_PWA_PREVIEW_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'node:child_process' {
  export function execFileSync(
    file: string,
    args: readonly string[],
    options: {
      encoding: 'utf8'
      stdio: readonly ['ignore', 'pipe', 'ignore']
    }
  ): string
}
