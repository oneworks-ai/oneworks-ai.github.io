# Docs App Guide

## Scope

- This app is the standalone VitePress documentation site for user-facing One Works docs.
- Source pages live in this directory and are assembled into the homepage build under `/docs/`.
- Keep VitePress theme, plugin registration, sidebar search, and Markdown tooling in `.vitepress/`.

## Content

- User-facing usage changes should be reflected here first.
- Repository-local `.oo/docs/` content is only for README-style module documentation that should not live in the public root docs site.
- Internal maintenance, packaging, release, CI, signing, hidden debug, and agent guide content should stay out of the public VitePress build. Keep `AGENTS.md` excluded through VitePress config.
- Public documentation images belong in `public/` or a nearby docs asset folder; avoid relative paths that escape this app.

## Style

- Docs are intentionally independent from the Astro homepage. Do not import `apps/homepage` components, layouts, or page CSS.
- Prefer VitePress conventions first: `config.mts` for nav/sidebar/search, theme slots for small UI additions, and `custom.css` for visual tuning.
- Keep the docs UI dense and readable. Use 8px or smaller radii, restrained colors, and stable content widths.

## Validation

- Run `pnpm -C assets/homepage --filter @oneworks/docs build` after structural, config, theme, or content migration changes.
- For local preview, use the repository fast path `pnpm tools dev-start docs` unless the user explicitly asks for a lower-level VitePress command.
