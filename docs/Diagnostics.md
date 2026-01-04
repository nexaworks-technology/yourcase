# Diagnostics & Error Handling

Components
- RouteChunkBoundary: wraps routes, shows errors with retry/backoff, offline banner, copy/report, reduced‑motion countdown.
- Settings → Diagnostics: toggle route retry telemetry (sessionStorage `yc_route_retry_log`), preview/copy/download/clear.

Flows
- Toggle telemetry on to capture route retry events in the current session.
- Use Navbar quick view diagnostics shortcuts or Settings Diagnostics to preview/copy the latest entries.

Accessibility
- Dialogs are keyboard accessible; live regions announce state changes.

