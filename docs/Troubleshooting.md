# Troubleshooting

Common issues and quick fixes when developing or building the YourCase web client.

## Dev server won’t start
- Port 5173 in use
  - Close the other process or run: `npm run dev -- --port 5174`
  - Or set `server.port` in `frontend/vite.config.js`.
- Node version mismatch
  - Use Node LTS (v18+). If using nvm: `nvm use --lts`.
  - Clean install: `rm -rf node_modules package-lock.json && npm ci`.
- Cache hiccups
  - Remove Vite cache: `rm -rf node_modules/.vite` then `npm run dev`.

## Build fails
- Out of memory
  - `NODE_OPTIONS=--max_old_space_size=4096 npm run build`.
- Plugin/transform errors
  - Clean deps: `rm -rf node_modules package-lock.json && npm ci`.
  - Retry: `npm run build`.
- Env/config
  - Ensure any required `.env` values exist or defaults are present.

## Blank page or route error panel
- Offline
  - The boundary shows an offline banner; reconnect and click Retry or enable auto‑retry.
- Stuck after error
  - Press `R` to retry; use “Copy details” to inspect error and report.
- Hard reload
  - Browser hard‑refresh to clear any stale assets (no SW by default).

## Quick View (Recent toasts)
- Missing latest export/import chip
  - Chips are session‑scoped. Ensure the action happened in the same tab.
  - Use the “Last import” button (Settings) or “Reload” control to refresh list.
- Pinned‑only hides items unexpectedly
  - Toggle off pinned‑only; check stats pill (shown/total · pinned).

## CSV Import Mapping
- Wrong dates
  - Pick the correct Date format (auto, epoch_ms, epoch_s, dd/MM/yyyy, MM/dd/yyyy, yyyy‑MM‑dd, ISO).
  - Ambiguous dates? Try switching dd/MM ↔ MM/dd.
- Epoch confusion
  - Values in seconds? Use `epoch_s`; in milliseconds? Use `epoch_ms`.
- Blank rows
  - Enable “Treat blank time as now” and/or “Ignore blank messages.”
- Continue disabled
  - Message column all blank and ignore‑blank off; select a proper Message column or toggle ignore‑blank.

## Storage reset
- Keys live in session/local storage (see READMEs/guides).
- Clear via DevTools → Application → Storage, or run in console:
```
['yc_toasts_recent','yc_toasts_pinned_only','yc_toasts_pin_first','yc_toasts_qv_query','yc_toasts_last_summary','yc_toasts_badge_dismissed','yc_route_retry_log'].forEach(k=>sessionStorage.removeItem(k));
localStorage.removeItem('yc_csv_mapping');
```

## Playwright tests
- Install browsers: `npm run test:install`.
- Run stable: `npx playwright test --project=chromium --workers=1`.
- Timeouts
  - Prefer role/selectors for stable elements (e.g., buttons) over text.
  - Ensure correct route (hash vs history), e.g., `/#/settings` if needed.

## Performance & bundles
- Large pdf worker chunk
  - Expected; it’s split into its own chunk.
- “Also statically imported” warnings
  - Ensure lazily loaded modules aren’t also re‑exported statically.

## Git & PR
- Push issues
  - Set upstream: `git push -u origin portalcode`.
  - Open PR via compare: https://github.com/nexaworks-technology/yourcase/compare/main...portalcode

If issues persist, capture the error details (boundary “Copy details”, console logs) and include steps to reproduce.

