# Router & Navigation Patterns

Guidelines for defining routes, handling deep links, managing scroll/focus, and integrating the error boundary.

## Routing mode
- The app uses React Router. Some environments may use hash routing for predictable static hosting.
- When using hash routing, deep links look like `/#/settings#recent-toasts`.
- Ensure deploy targets are configured with SPA fallback to `index.html` (see DeployCookbook).

## Deep links and anchors
- Prefer stable route paths (e.g., `/settings`) with optional hash anchors for sub‑sections (e.g., `#recent-toasts`).
- On mount, read hash/URL params to focus and scroll the target section into view.
- Keep IDs stable and unique in the DOM for linking.

## Error boundary integration
- Wrap major routes with `RouteChunkBoundary` for resilience.
  - Label boundaries descriptively to improve diagnostics.
  - Users can Retry (`R` shortcut), see offline banner, and copy/report details.
- Do not catch and suppress route errors silently; allow the boundary to surface them.

## Lazy loading
- Lazy‑load heavy pages and subcomponents to keep initial bundle small.
- Avoid statically re‑exporting lazy modules to prevent Vite warnings.

## Scroll & focus management
- On navigation, reset scroll to top unless returning within the same list context.
- When opening a dialog from a route, trap focus inside and return focus to the trigger on close.
- After showing the error boundary, move focus to the panel so keyboard Retry works.

## Programmatic navigation
- Prefer React Router navigation helpers (e.g., `useNavigate`) instead of manipulating `window.location` directly.
- For in‑page anchors, update hash and call `element.scrollIntoView({ behavior: 'smooth' })` (respect reduced motion if applicable).

## Route params and search
- Keep params minimal and meaningful (ids, filters).
- For multi‑field filters, prefer query params (e.g., `?q=foo&page=2`) and provide Reset controls.
- Decode/encode carefully; never inject raw query values into the DOM without escaping.

## Guards & fallbacks
- Redirect unknown paths to a safe landing (e.g., dashboard) or show a friendly 404.
- Use skeletons/loaders while lazy chunks resolve; respect `prefers-reduced-motion: reduce` for transitions.

## Testing routes
- In Playwright, prefer stable role selectors over text when asserting route content.
- If using hash routing, navigate to `/#/path` and wait for a known control (e.g., a button) to appear.

## Examples
```jsx
// router/index.jsx (excerpt)
<RouteChunkBoundary label="settings">
  <SettingsPage />
</RouteChunkBoundary>
```

```js
// Deep link handler in Settings
useEffect(() => {
  const hash = window.location.hash
  if (hash.includes('recent-toasts')) {
    document.getElementById('recent-toasts')?.scrollIntoView()
  }
}, [])
```

