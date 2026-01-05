# UI Components Guide

This guide outlines common UI components and patterns used in the YourCase web client, with usage notes and accessibility guidance.

## Buttons
- Location: `src/components/ui/Button.jsx` (or similar)
- Usage:
```
<Button variant="primary" size="sm" onClick={...}>Action</Button>
```
- Variants: primary, secondary, ghost, danger (as implemented)
- Accessibility: ensure `aria-label` for icon-only buttons; disable with `disabled` and provide title/tooltip when needed.

## Modals / Dialogs
- Pattern: controlled open/close with focus trap; return focus to trigger element on close.
- Usage:
```
<Modal open={open} onClose={setOpen} title="Title" ariaLabelledby="modal-title">
  ...content...
  <div className="actions">
    <Button onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="primary" onClick={onConfirm}>Confirm</Button>
  </div>
  </Modal>
```
- Accessibility: `role="dialog"`, labelled by heading, `aria-modal`, ESC to close unless a blocking action.

## Tooltips
- Location: `src/components/ui/Tooltip.jsx`
- Usage:
```
<Tooltip content="Copy to clipboard"><Button iconOnly>📋</Button></Tooltip>
```
- Reduced motion: avoid animated entrances for users preferring reduced motion.

## Live announcer (aria-live)
- Location: `src/components/ui/LiveAnnouncer.jsx`
- Usage: for polite status updates (imports/exports, reloads, pinned-only toggles)
```
import { announce } from '../ui/LiveAnnouncer'
announce('Recent toasts reloaded', { toast: { variant: 'success' } })
```
- Keep messages concise; avoid repeated announcements.

## Skeletons / Loading States
- Pattern: small pulse or static placeholders shown briefly.
- Reduced motion: guard animations under `@media (prefers-reduced-motion: reduce)`.
- Usage: show while fetching/list preparing; set `aria-busy` on container.

## Forms & Inputs
- Inputs should have visible labels or `aria-label`/`aria-labelledby`.
- Provide `placeholder` as a hint, not a label substitute.
- Validate inline and describe errors with `aria-describedby`.

## Toasts & Notifications
- Library: `sonner` (already wired via announcer helpers).
- Use short, actionable messages; prefer success/info variants for non-errors.
- Avoid stacking too many toasts; summarize imports/exports succinctly.

## Keyboard shortcuts
- Provide clear hints near controls when shortcuts exist (e.g., “Esc clears · Enter focuses first row”).
- Scope shortcuts to focused regions (e.g., inside list panels) to avoid global conflicts.

## Examples in repo
- Navbar quick view controls: `src/components/layout/Navbar.jsx`
- Settings → Recent toasts: `src/pages/Settings.jsx`
- Error boundary: `src/components/RouteChunkBoundary.jsx`

## Conventions
- Prefer accessible roles/labels over custom selectors.
- Keep component variants minimal and documented.
- Respect reduced motion in any animated UI.

