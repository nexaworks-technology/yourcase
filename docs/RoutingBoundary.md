# Routing & Error Boundary

`RouteChunkBoundary` wraps routes to improve resilience and UX during code‑split loading and runtime errors.

## Behaviors
- Retry with exponential backoff: 0.5s → 1s → 2s → 4s (max 4 attempts)
- Offline detection: shows banner; optional auto‑retry when back online
- Error tools: Copy details, Report issue (mailto with prefilled env/context)
- Technical details panel: route label, timestamp, name/message, short stack
- Keyboard: `R` to retry when boundary is focused
- Reduced motion: countdown/animations suppressed under `prefers-reduced-motion: reduce`

## Integration
- Router usage: each major route is wrapped by the boundary
  - File: `src/router/index.jsx` (multiple `<RouteChunkBoundary label="...">` wrappers)
- Component: `src/components/RouteChunkBoundary.jsx`
- Diagnostics (optional): boundary logs retry/announce events when telemetry is enabled in Settings

## Telemetry
- Toggle in Settings → Diagnostics writes to `sessionStorage: yc_route_retry_log`
- Navbar quick view and Settings provide preview/copy/download/clear controls

## Tips
- Keep heavy sub‑routes/components lazy‑loaded to leverage boundary recovery
- When adding new routes, wrap them in `RouteChunkBoundary` with a descriptive `label`

