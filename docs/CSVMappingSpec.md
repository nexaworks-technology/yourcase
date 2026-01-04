# CSV Import Mapping Specification

This document defines the user‑facing CSV mapping flow used in Settings → Recent toasts and its constraints.

## Columns
- Time: user‑selected column parsed via selected date format
- Message: user‑selected column; required for a row to be accepted
- Pinned: optional; normalized from common truthy/falsey values (true/false, 1/0, yes/no, y/n, on/off)

## Date formats
- auto (best‑effort parse; prefers ISO)
- epoch_ms, epoch_s
- dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd, ISO

## Toggles (persisted)
- Treat blank time as now
- Ignore blank messages
- Persistence: `localStorage: yc_csv_mapping`

## Validation
- If Message column is empty and “Ignore blank messages” is off → block Continue
- Invalid time cells highlighted in sample; hint shows first invalid sample
- Live mapped count shown before preview

## Import modes
- Merge: append non‑duplicates (keyed by `t|m`), keep latest 10 overall
- Replace: replace all existing rows

## Presets
- Save/apply presets; set default; import/export with Replace confirmation

## Preview & summaries
- Import Preview shows +M (new), kept K (latest 10), pinned count
- Export preview supports JSON/CSV; ZIP offers both as tabs

## Notes
- CSV parser is minimal and may not cover RFC4180 embedded newlines in fields; consider a robust parser if needed
- For very large CSVs, consider a worker‑based parser and capped samples

