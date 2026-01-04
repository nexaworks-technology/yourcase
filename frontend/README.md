# YourCase Web — Frontend

Vite + React app for YourCase. Recent updates focus on:
- Navbar “Recent toasts” quick view (exports/imports, pinned controls, keyboard shortcuts)
- CSV import mapping polish (date formats, persisted toggles)
- Diagnostics (route retry telemetry) and improved error boundary
- Reduced‑motion accessibility and small skeletons

## Quick start

- Dev: `npm install` then `npm run dev` (http://localhost:5173)
- Build: `npm run build` (output in `dist/`)

## Key features

- Recent toasts quick view (Navbar)
  - Export JSON/CSV/ZIP; Import JSON/CSV with merge/replace
  - Filter, “Pinned only”, “Pin first”, per‑row pin/delete, keyboard: P/Del
  - Stats pill; defaults badges; export chip with deep‑link; small “Copied” pill for copy

- Settings → Recent toasts
  - CSV Mapping Modal: auto/epoch/dd‑MM/MM‑dd/yyyy‑MM‑dd/ISO
  - Persisted mapping + toggles (localStorage `yc_csv_mapping`)
  - Import Preview summary; Export preview (JSON/CSV/ZIP tabs), Copy all, Download now
  - Clear/Restore badge, Reset dismissal; aria‑busy skeletons and keyboard hints

- Diagnostics
  - Route retry telemetry toggle (sessionStorage `yc_route_retry_log`)
  - Preview last entries, Copy all, Download/Clear

## Storage keys

- Session: `yc_toasts_recent`, `yc_toasts_pinned_only`, `yc_toasts_pin_first`, `yc_toasts_qv_query`, `yc_toasts_last_summary`, `yc_toasts_badge_dismissed`, `yc_route_retry_log`
- Local: `yc_csv_mapping`

## Accessibility

- Respects `prefers-reduced-motion: reduce`
- Modals and controls keyboard‑friendly; live announcements for key actions

## Notes

If you run into build issues, ensure Node LTS and a clean `node_modules` then `npm ci && npm run build`.
