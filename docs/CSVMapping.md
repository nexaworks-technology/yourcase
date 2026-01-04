# CSV Import Mapping

Where: Settings → Recent toasts → Import CSV.

Capabilities
- Map CSV columns for Time, Message, and Pinned.
- Date formats: auto, epoch_ms, epoch_s, dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd, ISO.
- Toggles persisted: “Treat blank time as now”, “Ignore blank messages” (localStorage `yc_csv_mapping`).
- Live stats: mapped rows count; invalid time samples highlighted with tooltip; parsed preview column.
- Import Preview summary: +M new, kept K, latest 10; drop‑count note when blanks ignored.
- Presets: save/apply, set default; import/export with Replace confirmation.

Tips
- If Message column is empty and “Ignore blank messages” is off, Continue is blocked.
- Use Sample JSON/CSV to understand structure; preview before applying replace/merge.

