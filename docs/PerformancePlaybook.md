# Performance Playbook

Guidance to keep the YourCase web client fast in development and production.

## Table of Contents
- Goals
- Analyze bundles
- Code‑splitting strategy
- Network & assets
- React rendering
- CSS & layout
- Images and fonts
- Measuring impact
- Checklist before merging

## Goals
- Small initial payload; fast first paint and interaction.
- Lazy‑load heavy features; predictable chunk boundaries.
- Avoid avoidable re‑renders and layout thrash.

## Analyze bundles
- Build locally: `cd frontend && npm run build`
- Inspect output sizes in `dist/` (Vite prints chunk sizes and gzip).
- Spot checks:
  - Ensure heavy deps (pdfjs, router, query, store, icons) are split into own chunks.
  - Large page bundles (page‑document/matter/settings) should only include what they need.

Tips
- For deeper analysis, add a temporary visualizer plugin locally (do not commit):
  - `npm i -D rollup-plugin-visualizer`
  - Import in `vite.config.js` and open the generated report.
  - Example (do NOT commit):
    ```js
    // vite.config.js (local only)
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    import { visualizer } from 'rollup-plugin-visualizer'

    export default defineConfig({
      plugins: [react(), visualizer({ open: true, filename: 'stats.html' })],
    })
    ```
  - After review, remove the plugin and stats file before committing.

## Code‑splitting strategy
- Keep `manualChunks` for: pdfjs, router, query, store, icons, and page bundles.
- Lazy‑load heavy subcomponents (e.g., modals, viewers, editors) inside pages.
- Do not statically re‑export modules that are expected to be lazy loaded.

Heuristics
- If a component is not needed on first meaningful paint or is rarely used → lazy.
- If a helper is small and used across many routes → keep in shared chunk.

## Network & assets
- Prefer SVG icons from `lucide-react` (already chunked) or inline for small custom icons.
- Compress screenshots/GIF docs assets; docs don’t ship to users, but keep repo lean.
- Use `import.meta.env` for toggling optional features without shipping dead code.

## React rendering
- Split large lists into virtualized lists if they grow (keep simple until needed).
- Memoize expensive components/derivations (`useMemo`, `useCallback`) when props/state churn.
- Lift state only when necessary; keep local state close to components.
- Avoid passing new inline objects/functions to deep trees without memoization.

## CSS & layout
- Prefer CSS transforms for animations; avoid layout‑thrashing properties (top/left) during transitions.
- Batch DOM writes/reads when doing manual measurements.
- Respect `prefers-reduced-motion: reduce`; reduce animation work under it.

## Images and fonts
- Serve appropriately sized images; avoid oversized raster images in UI.
- Use system fonts or a single webfont family/weights where possible; preload if necessary.

## Measuring impact
- Dev: use React Profiler to identify re‑render hotspots.
- Prod: Lighthouse locally against `vite preview`; track LCP/INP variance across changes.
- Watch chunk diffs across commits (Vite build sizes) to catch regressions early.

## Checklist before merging
- [ ] Build shows expected manual chunks; no unexpected huge common chunk
- [ ] Heavy components are lazy‑loaded
- [ ] No “also statically imported” warnings during build
- [ ] No obvious re‑render loops; props/state stable where needed
- [ ] Reduced‑motion guards applied to new animations
