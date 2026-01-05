# UX Copy & Tone

Guidelines for concise, consistent, and accessible copy across the app: labels, buttons, toasts, errors, and keyboard hints.

## Principles
- Clarity first: say the action and outcome in plain language.
- Brevity: prefer short phrases (<60 chars) without losing meaning.
- Action-oriented: lead with verbs for buttons and toasts.
- Consistency: use the same words for the same concepts.
- Accessibility: announce important changes succinctly; avoid jargon.

## Voice & tone
- Friendly, professional, and direct.
- Prefer present tense and active voice.
- Avoid exclamation marks and superlatives; keep neutral.

## Buttons & labels
- Use Title Case for primary actions (e.g., “Import CSV”, “Download ZIP”).
- Keep to 1–3 words.
- Icon-only buttons must have `aria-label` and a tooltip.

## Field labels & placeholders
- Always include a visible label or aria label.
- Placeholders are hints, not labels (use sentence case).
- Keep examples concrete: “Search cases” instead of “Type here…”.

## Toasts
- Keep to one sentence; include the key outcome and count when relevant.
- Start with the outcome keyword: “Import complete …”, “Export ready …”.
- Variants
  - Success: positive results (“Import complete · +8/parsed 42 · kept 10”).
  - Info: hints, deep-links (“Open Settings → Recent toasts to preview …”).
  - Warning: non-blocking issues (“0 rows mapped — select a Message column”).
  - Error: actionable failure (“Import failed. Please try again.”).

## Errors & inline banners
- State what happened and how to fix it (if known).
- Avoid blaming language; be specific: “Couldn’t parse dates. Try ‘dd/MM/yyyy’.”
- Prefer inline banners for view-specific problems; toasts for global events.

## Keyboard hints
- Show near the control when shortcuts exist: “Esc clears · Enter focuses first row”.
- Keep hints subtle; use tooltips on desktop where appropriate.

## Capitalization & punctuation
- Sentence case for sentences; Title Case for button labels and headings.
- Avoid terminal periods in short labels/buttons (“Reload”, not “Reload.”).
- Use en dashes for brief contrasts (“merge — keeps existing”).

## Terminology
- Use the same terms across UI and docs:
  - “Recent toasts” (not “notifications list”)
  - “Merge” vs “Replace” for import modes
  - “Pinned only”, “Pin first” for filters/sorts

## Examples
- Good
  - Button: “Import CSV”
  - Toast: “Export ready · 10 items. Click to view.”
  - Error banner: “0 rows mapped — select a Message column.”
- Avoid
  - “Proceed” (unclear action)
  - “Operation successful!!!” (exclamations, vague)
  - “Something went wrong” (no guidance)

## Do / Don’t
- Do: quantify results when useful (counts, deltas).
- Do: prefer concrete nouns (“rows”, “items”, “files”).
- Don’t: introduce synonyms for the same concept.
- Don’t: overuse abbreviations or internal jargon.

