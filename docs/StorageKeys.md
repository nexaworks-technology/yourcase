# Storage Keys Reference

Table of Contents
- Session Storage
- Local Storage
- Resetting Keys
- Notes

This document lists sessionStorage and localStorage keys used by the YourCase web client, their purpose, and reset guidance.

[← Back to docs index](./README.md)

## Session Storage
- yc_toasts_recent
  - Type: array of { t: number, m: string, p?: boolean }
  - Purpose: Recent toasts displayed in Navbar quick view and Settings → Recent toasts
- yc_toasts_pinned_only
  - Type: boolean
  - Purpose: Quick view filter to show pinned items only
- yc_toasts_pin_first
  - Type: boolean
  - Purpose: Quick view sort hint to place pinned items first
- yc_toasts_qv_query
  - Type: string
  - Purpose: Current filter query in the quick view panel
- yc_toasts_last_summary
  - Type: { type: 'import'|'export', format: 'json'|'csv'|'zip', mode?: 'merge'|'replace', imported?: number, kept?: number, count?: number, ts: number }
  - Purpose: Last import/export summary; used by badges and deep‑links
- yc_toasts_badge_dismissed
  - Type: boolean
  - Purpose: Hides the export/import badge in Navbar quick view for the session
- yc_route_retry_log
  - Type: array of retry/announce entries
  - Purpose: Diagnostics log when telemetry is enabled in Settings → Diagnostics

## Local Storage
- yc_csv_mapping
  - Type: { timeCol?: string, msgCol?: string, pinCol?: string, dateFmt?: string, treatBlankTimeAsNow?: boolean, ignoreBlankMessages?: boolean }
  - Purpose: Remembers CSV import column mapping, date format, and mapping toggles

## Resetting Keys
Use DevTools → Application → Storage or run in the console:
```
sessionStorage.removeItem('yc_toasts_recent');
sessionStorage.removeItem('yc_toasts_pinned_only');
sessionStorage.removeItem('yc_toasts_pin_first');
sessionStorage.removeItem('yc_toasts_qv_query');
sessionStorage.removeItem('yc_toasts_last_summary');
sessionStorage.removeItem('yc_toasts_badge_dismissed');
sessionStorage.removeItem('yc_route_retry_log');
localStorage.removeItem('yc_csv_mapping');
```

## Notes
- Session keys apply per‑tab; actions in another tab may not reflect automatically.
- Local keys persist across sessions; prefer explicit reset if behavior seems stale.

---

Last updated: 2026-01-06
