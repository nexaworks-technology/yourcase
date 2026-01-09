# Data Import/Export Formats

Table of Contents
- JSON
- CSV
- ZIP
- Validation rules
- Import modes
- Export semantics
- Edge cases & tips
- Related docs

Reference for the JSON/CSV/ZIP formats used in Recent toasts import/export flows, plus edge cases and validation.

[← Back to docs index](./README.md)

## JSON
- Shape: array of entries
```json
[
  { "t": 1736066400000, "m": "Indexed 10 documents", "p": true },
  { "t": 1736063100000, "m": "Export complete", "p": false }
]
```
- Fields
  - `t` (number): timestamp in epoch milliseconds
  - `m` (string): message text (required unless mapping toggle ignores blanks)
  - `p` (boolean, optional): pinned flag

### Schema (example)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "RecentToastList",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["t", "m"],
    "additionalProperties": false,
    "properties": {
      "t": { "type": "number", "description": "Epoch milliseconds" },
      "m": { "type": "string", "minLength": 1, "description": "Message text" },
      "p": { "type": "boolean", "description": "Pinned flag" }
    }
  }
}
```

## CSV
- Columns: flexible; mapped via CSV Mapping Modal
  - Required: Message column (`m`)
  - Optional: Time (`t`), Pinned (`p`)
- Date formats supported for Time
  - `auto`, `epoch_ms`, `epoch_s`, `dd/MM/yyyy`, `MM/dd/yyyy`, `yyyy-MM-dd`, `ISO`
- Mapping toggles
  - Treat blank time as now
  - Ignore blank messages
- Sample CSV
```csv
Time,Message,Pinned
2025-01-05,Indexed 10 documents,true
1736063100,Export complete,false
,,true
```

### CSV examples with quoting and escapes
```csv
Time,Message,Pinned
2025-02-01,"Message, with comma",true
2025-02-02,"He said ""ok"" and left",false
2025-02-03,"Multiline body starts→\nline 2 continues",false
```

## ZIP
- Convenience bundle containing both formats
- Contents
  - `toasts.json` — JSON array (see JSON section)
  - `toasts.csv` — CSV with headers (see CSV section)

## Validation rules
- Message
  - Required unless “Ignore blank messages” is enabled
  - Empty/whitespace-only rows are dropped when ignored
- Time
  - Parsed per selected format; invalid cells are highlighted in preview
  - When “Treat blank time as now” is enabled, blanks resolve to the current time
  - Epoch seconds vs milliseconds: `epoch_s` expects seconds, `epoch_ms` expects milliseconds
- Pinned
  - Normalized truthy/falsey: true/false, 1/0, yes/no, y/n, on/off (case-insensitive)

## Import modes
- Merge
  - Append non-duplicates using key `${t}|${m}`; propagate pinned when merging
  - Keep latest 10 entries overall
- Replace
  - Replace all existing entries with the imported set

## Export semantics
- Exports reflect the current list in the quick view/Settings (up to latest 10)
- JSON is a direct serialization; CSV includes `Time,Message,Pinned` headers
- ZIP contains both JSON and CSV for convenience

## Edge cases & tips
- CSV quoting
  - Fields with commas must be quoted: `"2025-01-05","Message, with comma",true`
  - Embedded quotes should be doubled: `"He said ""ok"""`
- Line endings
  - CRLF and LF are both accepted
- BOM
  - UTF-8 BOM is ignored when present
- Timezones
  - Non-ISO strings without timezone are treated as local time
- Large files
  - Consider importing in smaller batches; preview shows a sample before applying

## Related docs
- CSV Mapping (user guide): `docs/CSVMapping.md`
- CSV Mapping Specification: `docs/CSVMappingSpec.md`
- Quick View: `docs/QuickView.md`

---

Last updated: 2026-01-06
