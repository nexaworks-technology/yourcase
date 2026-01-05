# Testing Guide

End-to-end (E2E) tests are written with Playwright. This guide covers setup, how to run tests, selector conventions, routing notes, and CI tips.

## Setup
- Install dependencies: `cd frontend && npm install`
- Install Playwright browsers: `npm run test:install`

## Running tests
- Run all tests (Chromium):
  - `npx playwright test --project=chromium --workers=1`
- Record a new test:
  - `npx playwright codegen http://localhost:5173`
- Headed mode for debugging:
  - `npx playwright test --headed --project=chromium --workers=1`

## Preview server (if needed)
- Some setups use Playwright’s webServer to build and preview the app:
  - Config file: `frontend/playwright.config.ts`
  - Typical flow: build → preview (`vite preview`) → run tests
- If routes are hash-based, make sure tests navigate to `/#/path`.

## Selector conventions
- Prefer role-based and accessible selectors:
  - `getByRole('button', { name: 'Preview JSON' })`
  - `getByLabel('Search')`, `getByPlaceholder('Search')`
- Avoid brittle text-only selectors; prefer stable labels/roles.
- If needed, add `data-testid="..."` for non-semantic targets and document them.

## Routing notes
- Settings deep-links may use hashes (e.g., `/#/settings#recent-toasts`).
- When waiting for a page to load, prefer a stable control over raw text:
  - Example: wait for the Preview button instead of `text=Recent toasts`.

## Common scenarios
- Recent toasts quick view
  - Open quick view, import JSON/CSV, verify counts, toggle pinned-only and pin-first.
- CSV mapping
  - Upload small CSV, map columns, choose date format, verify mapped row count, open preview then cancel.
- Diagnostics
  - Enable telemetry, trigger a route error (simulate offline), verify log entries, clear log.

## CI tips
- Use `--workers=1` to avoid port conflicts when preview server is used.
- Increase timeouts for slower runners: `PWTEST_TIMEOUT=60000`.
- Artifacts (videos/screenshots) can be enabled in `playwright.config.ts` (already present if tests were added).

## Troubleshooting
- Tests time out waiting for elements
  - Ensure the correct route (hash vs history) and use stable role selectors.
- Build/preview failures
  - Run locally: `npm run build` then `vite preview` and test against `http://localhost:4173`.
- Flaky UI animations
  - Prefer reduced-motion mode or disable transitional assertions (wait for `aria-busy=false`).

