# One Works AI Web

Static web workspace for One Works AI.

## Structure

- `apps/homepage`: Astro homepage served from `/`.
- `apps/docs`: VitePress documentation site served from `/docs/`.
- `scripts/assemble-pages.mjs`: combines built site outputs into `dist/` for GitHub Pages.

## Commands

- `pnpm dev:homepage`: run the Astro homepage locally.
- `pnpm dev:docs`: run the VitePress docs locally.
- `pnpm build`: build and assemble the GitHub Pages artifact.
- `pnpm check`: run the current validation pass for both sites.

## Download Resolution

Homepage desktop download links are resolved at runtime from the
`oneworks-ai/app` GitHub Releases API. The page detects the
visitor's operating system and architecture, then picks the newest desktop
release asset that matches that platform. If no matching installer can be
found, the link falls back to the GitHub Releases page.
