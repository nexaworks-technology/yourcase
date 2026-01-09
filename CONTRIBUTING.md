# Contributing to YourCase Web (ycweb)

Thank you for contributing! This guide explains local setup, coding standards, and how to propose changes safely.

## Prerequisites
- Node.js LTS (v18+ recommended)
- npm 9+

## Setup
```
cd frontend
npm install
npm run dev   # http://localhost:5173
npm run build # production build in dist/
```

## Branch & PR workflow
- Create a feature branch from `main` (e.g., `feature/xyz`). For Portal sessions we use `portalcode`.
- Keep commits scoped and descriptive.
- Open a PR to `main` with a clear summary (what/why) and screenshots/GIFs when UI changes are involved.

## Commit messages
- Use concise present tense (e.g., "Navbar: add quick stats pill").
- Group related changes; avoid mega-commits.

## Testing & validation
- Build locally: `npm run build`
- If Playwright tests are enabled, run them with:
  - `npm run test:install`
  - `npx playwright test --project=chromium --workers=1`
- Manually verify:
  - Reduced‑motion accessibility (prefers-reduced-motion)
  - Keyboard navigation for dialogs/menus
  - Screenreader announcements for key actions

## Coding standards
- Follow existing ESLint and project conventions.
- Prefer accessible components and keyboard support.
- Respect reduced‑motion: avoid mandatory animations; guard with media queries where used.

## Adding screenshots & GIFs
- Place assets under `docs/assets/`:
  - `quickview.png|gif`
  - `csv-mapping.png|gif`
  - `diagnostics.png|gif`
- Optimize images (lossless for PNG; looped, small for GIF). Suggested tools: `squoosh`, `ffmpeg`.
- Reference assets from the docs using relative paths.

## Docs updates
- Update `ycweb/README.md` for repo-level changes.
- Feature guides live in `ycweb/docs/` (QuickView, CSVMapping, Diagnostics).

## PR checklist
- [ ] Build passes (`npm run build`) and preview works
- [ ] Accessibility: keyboard navigation, focus order, reduced‑motion
- [ ] Desktop and mobile UI verified (no layout regressions)
- [ ] Docs updated (README and/or guides in `docs/`)
- [ ] Screenshots/GIFs added if UI changed (with alt text)
