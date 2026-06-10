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
