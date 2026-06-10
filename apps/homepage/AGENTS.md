# Homepage App Guide

## Shared Header And Footer

- New homepage pages must use `src/components/SiteHeader.astro` for the top brand, primary tabs, product dropdown, language menu, GitHub action, and homepage download shortcut. Do not copy header markup into individual pages.
- New homepage pages must use `src/components/SiteFooter.astro` for the common footer. Do not copy footer markup into individual pages.
- The landing page uses the default `site-header` / `room-corner-brand` styling and passes `showCornerDownload`; app release pages pass `className="app-release-header"` and `brandClassName="app-release-brand"`.
- Keep product dropdown entries, header action icons, footer links, and footer social actions in the shared components; page-level changes should only choose variants through props.
- `SiteHeader.astro` owns the fixed top scrim (`.site-header-scrim`) that prevents scrolled content from visually colliding with the header. New pages should not add separate header masks or brand glass chips; reuse `SiteHeader` so the homepage and release pages keep the same scroll readability behavior.
- When adding or changing homepage pages, verify the shared header on `/`, `/app/`, `/app/:version/`, `/blog/`, and `/blog/:slug/` as one visual set. The top tabs, product dropdown, language/GitHub actions, glass background, overlay z-index, and footer must remain consistent across those pages.

## App Release Pages

- Desktop download and release detail pages are first-class homepage pages. They must keep the same shared header/footer behavior as the homepage, including the product menu, language action, GitHub action, and footer.
- Do not style release page top-level wrappers as cards. Page-level wrappers such as `.app-download-panel`, `.app-version-list`, and `.app-release-detail` should stay transparent, borderless, shadowless, and unpadded; use inner controls, rows, and asset buttons for framed UI.
- Keep release page layout rhythm centralized in `src/styles/global.css` under `.app-release-shell`. Use `--app-release-block-gap` for top-level vertical spacing and `--app-release-content-max-width` for the shared content width instead of adding one-off margins or max-width values.
- The release page block gap is currently `10px`. New release subpages should inherit that spacing rather than introducing separate `clamp(...)`, `18px`, or page-specific top margins.
- Detail pages should use a breadcrumb row with an icon-only back button plus parent/current labels. Do not add a separate “back” button in the page header, and do not include the homepage as a breadcrumb level.

## Scroll Narrative

- Keep one PWA iframe instance. Do not remount the iframe or swap the iframe DOM when moving between homepage scenes.
- Never replace the PWA preview with screenshots, static mockups, or a second iframe. If a scene needs a different app state, reuse the existing iframe and drive it with preview URL params plus `postMessage`.
- Treat scroll position as the source of truth: `scrollY -> progress -> rect/mode/copy`.
- Scene-to-scene window movement must be continuous. When moving from one section layout to another, interpolate the same rect fields (`left`, `top`, `width`, `height`) from the previous scene to the next.
- Offscreen previews should move the real window offscreen by its rect, for example exposing half of the existing iframe window. Do not build a cropped duplicate window to fake this.
- Auto snap should only change the page scroll position. The iframe window layout must still be derived from scroll progress.
- Auto snap logic should be page-list based, not hard-coded for only two scenes. Add new scene anchors to a shared target list such as `new -> room -> sidebar`.
- During scroll-linked movement, do not add CSS transitions to the fixed window container. Extra transitions make the window lag behind the scroll position.
- User wheel or touch input should interrupt auto snap, then the page can re-evaluate the nearest target after input settles.
- Keep the preview iframe navigation inside the iframe via `postMessage`; the outer homepage should not replace the iframe just to show a different preview route.

## Local PWA Preview

- When developing the homepage locally, run the embedded PWA with the Vite dev server on port `4173`; do not use `vite preview` or rebuild `apps/client` for every visual tweak.
- Preferred local command from the repo root:
  `__ONEWORKS_PROJECT_CLIENT_MODE__=standalone __ONEWORKS_PROJECT_CLIENT_BASE__=/ __ONEWORKS_PROJECT_CLIENT_HOMEPAGE_PREVIEW__=1 pnpm -C apps/client exec vite --host 127.0.0.1 --port 4173 --strictPort`
- Keep `__ONEWORKS_PROJECT_CLIENT_HOMEPAGE_PREVIEW__=1` in the local command because the homepage mock runtime is compile-time gated and the local iframe uses base `/`, not the official `/pwa/` base.
- Keep the Astro homepage on `4321` and point the iframe at the live dev server (`http://localhost:4173/...`) so `apps/client` changes update through HMR.

## Sidebar Scene

- The sidebar scene showcases the app's extensible left space, not just navigation. Copy and cards should mention custom plugins plus built-in capabilities such as asset management and task scheduling.
- Hide adapter badges in the sidebar scene instead of repositioning them over the window; the sidebar content is the focus.
- If the sidebar should appear expanded, pass that state into the reused PWA iframe rather than creating a separate local rendering.

## Copy Review

- For visible Chinese hero or section copy, propose a few options and get confirmation before committing wording when the user is discussing tone or positioning.
- Avoid literal translation phrasing. Prefer direct product language that sounds natural in Chinese, then align English i18n to the confirmed meaning.
