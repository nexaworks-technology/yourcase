# Recent Toasts Quick View

Table of Contents
- Features
- Storage keys
- Screenshots / GIFs

Location: Navbar → Help/quick view panel.

[← Back to docs index](./README.md)

Features
- View recent toasts (session), pin/unpin, delete rows.
- Export JSON/CSV/ZIP; Import JSON/CSV (merge or replace).
- Filter query, “Pinned only” and “Pin first” controls.
- Keyboard: P to pin/unpin, Delete to remove; Esc clears filter; Enter focuses first item.
- Quick stats pill (shown/total · pinned): click to toggle pinned‑only.
- Defaults badges: set default behavior for pinned‑only and pin‑first; reset defaults.
- Export chip: shows last export; deep‑link to Settings; dismiss persists in session.
- Reduced‑motion: loading skeletons and transitions respect user preferences.

Keyboard Shortcuts
| Shortcut | Action                 | Context                    |
|----------|------------------------|----------------------------|
| P        | Pin/unpin row          | Quick view list (row focus) |
| Delete   | Delete row             | Quick view list (row focus) |
| Esc      | Clear filter / Close   | Filter input / Panel open   |
| Enter    | Focus first row        | Filter input focused        |

Storage keys
- Session: `yc_toasts_recent`, `yc_toasts_pinned_only`, `yc_toasts_pin_first`, `yc_toasts_qv_query`, `yc_toasts_last_summary`, `yc_toasts_badge_dismissed`

Screenshots / GIFs
- Add a screenshot or GIF at `docs/assets/quickview.png` or `docs/assets/quickview.gif` and reference here:
  ```md
  ![Quick view](./assets/quickview.png)
  ```

---

Last updated: 2026-01-06
