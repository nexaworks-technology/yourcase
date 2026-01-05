# Error Handling & Toasts

Guidance for surfacing errors and feedback consistently using the Route error boundary and toast notifications.

## Route errors (RouteChunkBoundary)
- Wraps routes to recover from code-split/load/runtime errors.
- Behaviors:
  - Retry with backoff (0.5s → 1s → 2s → 4s; max 4 attempts)
  - Offline banner; optional auto-retry when back online
  - Copy details (route, time, name, message, short stack) and Report issue (mailto)
  - Technical details disclosure; respects reduced motion for countdown/animations
- Usage: already applied in `src/router/index.jsx`.
- Tip: give each boundary a descriptive `label` to improve diagnostics.

## Toasts (sonner) — when and how
Use short, actionable messages; prefer toasts for ephemeral feedback and inline banners for blocking or persistent issues.

- Success
  - Import/export summaries, saves, clears
  - Example: `announce('Import complete · +12/parsed 50 · kept 10', { toast: { variant: 'success' } })`
- Info
  - Hints, mode changes, deep-link notices
  - Example: `announce('Open Settings → Recent toasts to preview the last export')`
- Warning
  - Non-blocking validation, partial completion
  - Example: `announce('0 rows mapped — select a Message column', { toast: { variant: 'warning' } })`
- Error
  - Immediate failures that the user can potentially retry
  - Example: `announce('Failed to load route. Press R to retry.', { toast: { variant: 'error' } })`

Avoid flooding: coalesce repeated events and keep messages <80 chars when possible.

## Inline banners vs toasts
- Use inline banners for issues coupled to a view (e.g., mapping invalid, zero rows) — keeps context.
- Use toasts for global, cross-view events (import/export complete, diagnostics toggles, deep-links).

## Accessibility
- Announcements use a polite live region; keep messages concise.
- Keyboard: ensure boundary focus management; `R` to retry when error panel is focused.
- Reduced motion: avoid animated entrances for error panels; keep transitions minimal.

## Offline handling
- Boundary shows an offline banner; disable heavy fetches while offline.
- Provide a clear recover path: Retry button and optional auto-retry when online.

## Copy/Report patterns
- Include route label, timestamp, error name/message, short stack in Copy details.
- Pre-fill mailto subject/body with environment info (app version, browser, URL) and copied error details.

## API/service errors (UI guidance)
- Normalize errors in services when possible; surface friendly messages in UI.
- For destructive actions, confirm intent and show success/error toasts.
- For long operations, show loading states and disable buttons to prevent duplicate submissions.

## Examples
```js
import { announce } from '../components/ui/LiveAnnouncer'

try {
  await doImport(file)
  announce('Import complete · +8/parsed 42 · kept 10', { toast: { variant: 'success' } })
} catch (e) {
  announce('Import failed. Please try again.', { toast: { variant: 'error' } })
}
```

```jsx
// Route wrapper
<RouteChunkBoundary label="settings">
  <SettingsPage />
  </RouteChunkBoundary>
```

