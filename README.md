# YourCase Web (ycweb)

YourCase is an AI‑assisted legal research platform. This repo contains the web client (frontend) and server code (backend) for the YourCase application. The latest work on the web client focuses on usability and reliability: a quick view for recent toasts/exports, CSV import mapping polish, diagnostics, and reduced‑motion accessibility.

## Repository layout

- `frontend/` — Vite + React app (primary focus of recent updates)
- `backend/` — server code (not modified in the latest work)
- `docs/` — documentation (start at `docs/README.md`), feature guides

## Frontend quick start

- Dev: `cd frontend && npm install && npm run dev` (http://localhost:5173)
- Build: `npm run build` (artifacts in `frontend/dist`)

## What’s new (high‑level)

- Navbar → “Recent toasts” quick view
  - JSON/CSV/ZIP actions with copy/download and aria‑live toasts
  - Import JSON (preview) and Import CSV with column mapping; merge vs replace
  - Per‑row pin/unpin and delete; “Pinned only” filter and “Pin first” sort
  - Keyboard shortcuts: P (pin/unpin), Delete (remove)
  - Quick stats pill (shown/total · pinned) with tooltip; click toggles pinned‑only
  - Defaults: “Pinned only default” and “Pin first default” badges; reset defaults
  - Export chip shows latest export; badge dismiss persists in session; deep‑links to Settings
  - Tiny transient “Copied” badge beside Copy actions
  - Reduced‑motion skeletons/transitions for loading states

- Settings → Recent toasts
  - CSV Mapping Modal with date formats: auto, epoch_ms, epoch_s, dd/MM/yyyy, MM/dd/yyyy, yyyy‑MM‑dd, ISO
  - Persisted mapping + toggles: “Treat blank time as now”, “Ignore blank messages” (`localStorage: yc_csv_mapping`)
  - Live stats: mapped rows count, invalid time hints, highlighted cells, parsed preview column
  - Presets: save/apply, set default, import/export with confirmation for Replace; small preview skeleton
  - Import Preview: compact footer summary (+M new, kept K, latest 10); drop‑count note when applicable
  - Import success toast standardization (merge/replace) with deep‑link to Settings → Recent toasts
  - Export preview modal (JSON/CSV, tabbed for ZIP), Copy all, Download now; transient “Copied” pill
  - Action bar: “Last import” summary, Clear/Restore badge, Reset dismissal (syncs Navbar chip via event)
  - Accessibility: aria‑busy skeletons, keyboard hints (Esc clears, Enter focuses first row), aria‑live updates

- Diagnostics & error handling
  - Route error boundary with retry backoff, offline banner + auto‑retry, copy/report details, reduced‑motion countdown
  - Settings → Diagnostics: toggle route retry telemetry (session `yc_route_retry_log`), preview, copy, download/clear

- Build & performance
  - Manual chunking for pdfjs, router, query, store, icons, and heavy pages
  - Clean production build; reduced initial bundle; lazy‑load heavy modals where needed

## Storage keys (reference)

- Quick view (session): `yc_toasts_recent`, `yc_toasts_pinned_only`, `yc_toasts_pin_first`, `yc_toasts_qv_query`, summary `yc_toasts_last_summary`, badge `yc_toasts_badge_dismissed`
- CSV mapping (local): `yc_csv_mapping`; last meta (session): `yc_csv_last_meta`
- Retry telemetry (session): `yc_route_retry_log`

## Accessibility & reduced motion

- Skeletons/animations guard under `prefers-reduced-motion: reduce`
- Keyboard‑accessible modals/controls; announcements via polite live regions

For detailed usage and step‑by‑step instructions, see `frontend/README.md`.
Documentation index:
- `docs/README.md`
Additional guides:
- `docs/QuickView.md`
- `docs/CSVMapping.md`
- `docs/Diagnostics.md`
- `docs/Architecture.md`
- `docs/RoutingBoundary.md`
- `docs/CSVMappingSpec.md`
