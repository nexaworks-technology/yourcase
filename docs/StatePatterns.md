# State & Persistence Patterns

Table of Contents
- Choose the right state owner
- Persistence tiers
- Patterns
- Avoid anti‑patterns
- Examples
- Cross‑tab considerations
- Testing

Guidelines for choosing where state lives, how it flows, and when to persist it.

[← Back to docs index](./README.md)

## Choose the right state owner
- Component state (useState/useReducer)
  - Local UI details (open/close, inputs, hover/focus hints)
  - Ephemeral values that reset on navigation
- Derived state
  - Compute from props/state with `useMemo` instead of storing duplicates
- Global store (Zustand)
  - Cross‑route preferences/ui flags used by many components (e.g., diagnostics toggle)
  - Avoid storing large/volatile datasets; prefer colocated component state

## Persistence tiers
- sessionStorage (tab‑scoped)
  - Short‑lived lists and session UI prefs (e.g., quick view filters, last summaries)
  - Keys: see Storage Keys reference
- localStorage (device‑scoped)
  - Durable preferences (e.g., CSV mapping + toggles)
  - Keep payloads small; document schema
- In‑memory only
  - Transient states that must not survive reloads (e.g., loading, temporary selections)

## Patterns
- Hydration on mount
  - Read persisted prefs in an effect guard and set initial component/store state
  - Validate shape; fall back safely
- Write‑through updates
  - When a preference changes, update state AND write to storage immediately
- Namespacing keys
  - Prefix with `yc_` and feature group (e.g., `yc_toasts_*`, `yc_csv_*`)
- Reset & clear
  - Provide clear reset paths in UI; document how to clear via DevTools console

## Avoid anti‑patterns
- Duplicated sources of truth (same flag in store + local state + storage)
- Large blobs in localStorage/sessionStorage (size limits, perf)
- Global stores for page‑local state; keep scope minimal
- Persisting unstable/derived values that can be recomputed

## Examples
- Session preference (quick view)
```
const [pinnedOnly, setPinnedOnly] = useState(() => {
  return sessionStorage.getItem('yc_toasts_pinned_only') === 'true'
})
useEffect(() => {
  sessionStorage.setItem('yc_toasts_pinned_only', String(pinnedOnly))
}, [pinnedOnly])
```

- Durable mapping (CSV)
```
const [mapping, setMapping] = useState(() => {
  try { return JSON.parse(localStorage.getItem('yc_csv_mapping')||'{}') } catch { return {} }
})
const saveMapping = (next) => {
  setMapping(next)
  localStorage.setItem('yc_csv_mapping', JSON.stringify(next))
}
```

## Cross‑tab considerations
- sessionStorage is per‑tab only; localStorage fires `storage` events across tabs
- If syncing localStorage across tabs matters, listen to `window.addEventListener('storage', ...)`

## Testing
- Prefer resetting storage in setup/teardown for deterministic tests
- Use stable helpers to read/write storage in tests to avoid typos

---

Last updated: 2026-01-06
