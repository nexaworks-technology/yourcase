# Developer Onboarding

Welcome to the YourCase web client. This guide gets you productive quickly and points to deeper docs for specific areas.

## Prerequisites
- Node.js LTS (v18+ recommended)
- npm 9+
- Git

## First run
```
cd frontend
npm install
npm run dev    # http://localhost:5173
npm run build  # production build → dist/
```

## Project layout
- App: `frontend/` (Vite + React)
- Docs: `docs/` (start at docs/README.md)
- Server: `backend/` (not touched by recent work)

## Scripts (frontend)
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — serve built app locally
- `npm run test:install` — install Playwright browsers (if tests in use)

## Branch & PR workflow
- Branch from `main` (e.g., `feature/xyz`); for Portal sessions we use `portalcode`.
- Keep commits scoped; write clear messages (present tense, affected area first).
- Open a PR to `main` with a concise summary and screenshots/GIFs when UI changes.

## Coding standards
- Follow existing ESLint and repo conventions; prefer accessible components.
- Respect reduced motion (`prefers-reduced-motion: reduce`).
- Keep motion subtle; provide non-animated fallbacks where possible.

## Testing
- E2E: Playwright (see docs/Testing.md)
  - `npm run test:install`
  - `npx playwright test --project=chromium --workers=1`
- Prefer role/label selectors (`getByRole`, `getByLabel`); avoid brittle text-only selectors.

## Docs
- Start at docs/README.md for the index.
- Add new guides under `docs/` and link them from the index.
- For screenshots/GIFs, place assets in `docs/assets/` and reference relatively.

## Common workflows
- Navbar quick view / Settings work: read QuickView, CSVMapping guides.
- Error handling / diagnostics: see RoutingBoundary and Diagnostics docs.
- Build & deploy: see BuildDeploy and DeployCookbook.

## Storage keys
- Session/local storage keys are documented in docs/StorageKeys.md.
- Use namespaced keys (`yc_*`) and keep payloads small.

## Troubleshooting
- See docs/Troubleshooting.md for common dev/build issues and quick fixes.

## Security
- Follow docs/SecurityChecklist.md; don’t introduce untrusted HTML or secrets.

## Opening a PR
- Ensure it builds locally, does not regress accessibility/desktop layout, and updates docs as needed.
- Provide a short summary with context and, if relevant, a before/after visual.

