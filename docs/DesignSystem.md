# Design System & Theming

This guide captures design tokens, theming decisions, and usage patterns for a consistent UI.

## Theming model
- Tailwind with class-based dark mode (`darkMode: 'class'` in `tailwind.config.js`).
- Theme toggling is handled by adding/removing the `dark` class on `html` or a top-level container.
- Prefer semantic utility classes (e.g., `text-gray-900 dark:text-gray-100`) over hard-coded colors.

## Tokens
- Colors
  - Semantic text: `text-gray-900` (light), `dark:text-gray-100` (dark)
  - Backgrounds: `bg-white`/`bg-slate-950` or `bg-slate-800` for panels
  - Borders: `border-slate-200` (light), `dark:border-slate-700` (dark)
  - Accent: CSS variable `--accent-color` mapped to Tailwind `accent` (`theme.extend.colors.accent`)
    - Usage: `text-accent`, `bg-accent`, `border-accent`
- Spacing
  - Tailwind spacing scale (e.g., `px-4`, `py-3`, `gap-3`, `mb-6`).
  - Keep gutters consistent: 8px multiples (`2, 3, 4, 6` in Tailwind units).
- Typography
  - Headings: `text-4xl` for primary page titles, `text-lg` for section titles.
  - Body: `text-sm` default for dense panels; `text-base` for main content.
  - Weight: `font-semibold` for headings, `font-medium` for actionable labels.

## Components & states
- Buttons
  - Primary: `bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50`.
  - Secondary: `border border-slate-700 text-gray-100 hover:border-slate-600`.
  - Ghost: `text-gray-400 hover:text-gray-100` for low-emphasis actions.
- Inputs
  - Panels: `bg-slate-800 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-500`.
  - Focus: `focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500`.
- Cards/Panels
  - `bg-slate-800 border border-slate-700 rounded-2xl` with `px-4 py-3` content padding.

## Motion & accessibility
- Reduced motion
  - Honor `prefers-reduced-motion: reduce`; avoid essential information via animation.
  - Skeletons: brief, low-contrast pulse; disable pulse under reduced motion.
- Keyboard
  - Clear focus outlines; ensure icon-only buttons have `aria-label`.
  - ESC closes menus/modals; provide hints for keyboard shortcuts where relevant.
- Live regions
  - Use polite announcements for imports, reloads, and preference toggles.

## Theming usage examples
- Text + background
```
<div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-950">...</div>
```
- Border + panel
```
<div className="bg-slate-800 border border-slate-700 rounded-lg">...</div>
```
- Accent
```
<button className="text-accent hover:opacity-90">Action</button>
```

## Adding new tokens
- Extend Tailwind in `frontend/tailwind.config.js` (e.g., add `brand`, `warning`).
- Use CSS variables for theme-swappable values when appropriate and map to Tailwind via `extend.colors`.
- Document new tokens and where to use them in this guide.

## Do/Don’t
- Do: use semantic colors and consistent spacing.
- Do: respect reduced motion and ensure accessible contrast.
- Don’t: hard-code colors inline when an existing token/utility exists.
- Don’t: rely solely on color to convey state; add icons/labels.

