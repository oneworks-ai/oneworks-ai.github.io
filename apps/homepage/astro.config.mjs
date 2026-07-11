import { defineConfig } from 'astro/config'

const site = process.env.ONEWORKS_SITE_URL?.trim() ||
  process.env.PUBLIC_ONEWORKS_SITE_URL?.trim() ||
  'https://oneworks.cloud'

export default defineConfig({
  output: 'static',
  site
})
