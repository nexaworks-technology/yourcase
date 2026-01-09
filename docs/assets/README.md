# Docs Assets Guide

Naming conventions
- Use lowercase, kebab-case names: `feature-area-screenshot.png`
- Keep names short and contextual: `quickview-export.gif`, `csv-mapping-modal.png`
- Prefer PNG for screenshots, GIF or MP4/WebM for short animations.

Recommended sizes
- Screenshots: width ≤ 1600px; optimize for clarity
- GIFs: keep under ~4–8 MB; consider WebM for longer clips

Alt text template
- Describe the key UI and action succinctly:
  - “Quick view panel showing recent toasts and export buttons”
  - “CSV Mapping modal with Time/Message columns selected and preview table”
  - “Settings page highlighting Diagnostics retry log controls”

Placement
- Put assets in `docs/assets/` and reference with relative paths:
  ```md
  ![Quick view panel showing recent toasts](./quickview.png)
  ```

Review checklist
- Alt text present and meaningful
- File name follows kebab-case
- File size reasonable (optimize if necessary)
- Content matches the section it illustrates

