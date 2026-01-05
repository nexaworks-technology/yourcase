# Architecture Overview

This document provides a high‑level view of the YourCase web client (frontend) architecture, focusing on routing, state, module boundaries, performance, and accessibility.

## Table of Contents
- Layers & responsibilities
- Data & persistence
- Routing model
- Performance & code splitting
- Accessibility & UX
- Folder layout
- Extension points

## Layers & responsibilities
- App shell: mounts router, theme, and layout (Navbar/Sidebar/Main). Provides skeletons and reduced‑motion guards.
- Routing: react‑router with `RouteChunkBoundary` wrapping pages to handle load errors, retries, and offline recovery.
- State: lightweight local state and component state; ephemeral session data via `sessionStorage`; durable prefs via `localStorage`. Zustand store is used for select global preferences (e.g., diagnostics toggle).
- Features: pages and feature modules (Documents, Matters, Settings, etc.) with local concerns and lazy‑loaded heavy subcomponents.

## Data & persistence
- No backend coupling documented here; dynamic data in these flows is local/session only.
- Storage keys (reference): see README or feature docs (QuickView, CSVMapping, Diagnostics).
- Import/Export (Recent toasts): JSON/CSV/ZIP in-memory with previews and summaries.

## Routing model
- Each route is wrapped by `RouteChunkBoundary` for resiliency.
- Lazy loading is applied to heavy pages or sub‑modules to reduce initial bundle size.
- Error boundary supports retry/backoff, offline awareness, and diagnostics friendliness (copy/report details).

## Performance & code splitting
- Vite manualChunks separate large deps: pdfjs, router, query, store, icons, and page bundles.
- Heavy modals (e.g., CreateMatterModal) are lazy‑loaded to silence dynamic/static import warnings and trim initial chunks.
- Production builds verified clean; keep an eye on pdf worker chunk sizes.

## Accessibility & UX
- Reduced motion: skeletons, countdowns, and transitions respect `prefers-reduced-motion: reduce`.
- Keyboard: dialogs, menus, and list actions support keyboard usage; hints provided in UI where helpful.
- Live regions announce important state changes (imports/exports, filters, telemetry toggles) without being noisy.

## Folder layout (frontend)
- `src/components/layout` — Navbar, Sidebar, Main layout, RouteChunkBoundary
- `src/pages` — feature pages (Documents, Matters, Settings, etc.)
- `src/router` — route definitions applying RouteChunkBoundary
- `src/store` — small Zustand store(s) for preferences/diagnostics
- `src/styles` — global CSS and reduced‑motion guards

## Extension points
- Add feature pages with lazy‑loaded heavy parts; wrap in `RouteChunkBoundary`.
- Use session/local storage helpers consistently for user preferences and ephemeral data.
- When adding motion, provide reduced‑motion fallbacks or guards.
