# Docs App Guide

## Scope

- This app is the standalone VitePress documentation site for user-facing One Works docs.
- Source pages are staged into `src/` by `../../scripts/prepare-docs-content.mjs` from the app repository `.oo/docs` content source, then assembled into the homepage build under `/docs/`.
- Keep VitePress theme, plugin registration, sidebar search, and Markdown tooling in `.vitepress/`.

## Content

- User-facing docs content changes should be made in the app repository `.oo/docs` source. Do not edit generated `src/` files.
- The source can be selected with `ONEWORKS_DOCS_SOURCE_DIR=/path/to/app/.oo/docs` or `ONEWORKS_APP_ROOT=/path/to/app`; the app submodule layout is auto-detected when available.
- Internal maintenance, packaging, release, CI, signing, hidden debug, and agent guide content should stay out of the public VitePress build. Keep `AGENTS.md` excluded through VitePress config.
- Public documentation images that belong to page content should live alongside `.oo/docs` Markdown. Site-level assets, such as the logo, remain in `public/`.

## Style

- Docs are intentionally independent from the Astro homepage. Do not import `apps/homepage` components, layouts, or page CSS.
- Prefer VitePress conventions first: `config.mts` for nav/sidebar/search, theme slots for small UI additions, and `custom.css` for visual tuning.
- Keep the docs UI dense and readable. Use 8px or smaller radii, restrained colors, and stable content widths.

## Validation

- Run `pnpm -C assets/homepage build:docs` after structural, config, theme, or content migration changes.
- Use `pnpm -C assets/homepage prepare:docs:dry-run` to inspect which app `.oo/docs` files would be staged without writing generated files.
- For local preview, use the repository fast path `pnpm tools dev-start docs` unless the user explicitly asks for a lower-level VitePress command.
