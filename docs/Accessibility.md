# Accessibility & Reduced Motion

This guide documents the accessibility practices used in the YourCase web client with concrete patterns to follow when contributing UI.

## Reduced Motion
- Respect user preference `prefers-reduced-motion: reduce`.
- Provide non-animated fallbacks for skeletons, countdowns, and transitions.
- Avoid essential information conveyed only through animation.

## Keyboard Navigation
- All dialogs, menus, and list rows must be navigable via keyboard.
- Provide clear focus outlines and keep focus within modals while open.
- Offer keyboard shortcuts for frequent actions and show hints (e.g., P to pin, Del to delete, Esc to clear).

## Live Regions & Announcements
- Use polite live regions to announce state changes (imports/exports, filters, telemetry toggles).
- Keep messages short; avoid noisy or repeated announcements.
- Announce counts or results after significant actions (e.g., "Recent toasts reloaded").

## Focus Management
- Move focus to surfaced error boundaries or newly opened dialogs.
- Return focus to the triggering element after closing dialogs.
- Prevent focus jank when skeletons render; use aria-busy and stable containers.

## Color & Contrast
- Ensure sufficient contrast for text and icons in both light and dark themes.
- Avoid conveying meaning with color alone (use icons/labels).
- Maintain accessible states for hover, focus, selected, and disabled controls.

## Storage of Preferences
- Respect user privacy; only store UI preferences (session/local storage) as documented.
- Keys are listed in README and feature docs; avoid adding new keys without documentation.

## Testing Checklist
- Tab through all interactive elements; verify focus order and trap behavior.
- Toggle reduced-motion and confirm animations/skeletons become minimal.
- Verify screen reader announcements for key actions.
- Check contrast with common tools; validate in light/dark themes.

## Reduced Motion Test Steps
- System setting: enable “Reduce motion” (macOS: Accessibility → Display; Windows: Accessibility → Visual effects; Linux/ChromeOS: system settings or browser flags).
- Browser check: verify `window.matchMedia('(prefers-reduced-motion: reduce)').matches === true` in DevTools console.
- App behaviors to verify:
  - No animated countdowns; timers switch to static labels.
  - Ripple/ink effects disabled (buttons/links still interactive).
  - Skeletons/pulses replaced with static placeholders.
  - Tooltips/popovers open without motion or with minimal fade.
  - Navbar quick view and Settings panels do not slide; appear instantly.
- Keyboard and SR:
  - Focus order unchanged with reduced motion.
  - aria-live announcements remain concise (no repeated messages).
- DevTools simulation (optional): emulate reduced motion in Chrome DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion.

---

Last updated: 2026-01-06

## References
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WCAG 2.2 (Focus visible, reduced motion): https://www.w3.org/TR/WCAG22/
