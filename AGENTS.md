# Homepage Workspace Guide

## Scope

- This workspace contains the public web surfaces for One Works: `apps/homepage` for the Astro homepage and release/download pages, and `apps/docs` for the documentation site.
- For any homepage page, release page, visual layout, navigation, or download UX change, continue reading `apps/homepage/AGENTS.md` before editing.
- For docs-only changes, work in `apps/docs` and keep homepage layout rules out of docs pages.
- `apps/docs` is an independently built VitePress app. Keep its theme, plugins, navigation, and sidebar in `apps/docs/.vitepress`; do not couple docs pages to Astro homepage components or styles.

## Homepage Page Rules

- Use `apps/homepage/src/components/SiteHeader.astro` and `apps/homepage/src/components/SiteFooter.astro` for homepage pages. Do not copy header/footer markup into new pages.
- Desktop download and release detail pages should follow the app release page rules in `apps/homepage/AGENTS.md`.
- Keep app release page spacing centralized in `apps/homepage/src/styles/global.css` under `.app-release-shell`; do not add page-specific top margins or card wrappers to top-level release page sections.
- The release page block gap is `10px`; new release pages and nested release details should inherit that rhythm through CSS variables instead of using one-off `clamp(...)`, `18px`, or page-specific margin values.

## Local Preview

- Use the root command `pnpm tools dev-start homepage` for local homepage preview unless the user explicitly asks for a lower-level command.
- The Astro homepage normally serves on `http://127.0.0.1:4321/`; the embedded PWA preview uses the separate client dev server documented in `apps/homepage/AGENTS.md`.
