# Coding Standards

Table of Contents
- Language & tooling
- ESLint
- Structure
- Naming
- Imports
- Accessibility
- Styling
- State
- Testing
- Commits & PRs

Conventions to keep the codebase consistent and accessible.

[← Back to docs index](./README.md)

## Language & tooling
- JS/JSX (ES2020+). ESLint configured in `frontend/eslint.config.js`.
- Run `npm run build` before PRs to catch build issues early.

## ESLint
- Base: `@eslint/js` recommended, React Hooks recommended, React Refresh vite config.
- Globals: browser.
- Custom rules:
  - `no-unused-vars`: error; ignores var names matching `^[A-Z_]` (useful for constants/envs).

## Structure
- Components
  - Keep components small and focused; colocate styles and minor helpers.
  - Name components in PascalCase; files as `ComponentName.jsx`.
  - Export a single default per file where practical.
- Pages
  - Route-level pages in `src/pages`; lazy-load heavy children.
- Layout
  - Shared layout in `src/components/layout` (Navbar, Sidebar, Main layout, RouteChunkBoundary).

## Naming
- Variables/functions: `camelCase`; Components: `PascalCase`.
- Booleans prefixed with `is/has/should`.
- Avoid abbreviations; prefer descriptive names.

## Imports
- Group: external libs → internal modules → relative components/styles.
- Prefer absolute or stable relative paths; avoid deep `../../../` chains when possible.

## Accessibility
- Respect `prefers-reduced-motion: reduce`.
- Ensure keyboard access for dialogs/menus; icon-only buttons must have `aria-label`.
- Use live regions sparingly for state announcements.

## Styling
- Tailwind utilities preferred; use semantic utility combos (`text-gray-900 dark:text-gray-100`).
- Avoid inline styles for static values; prefer utilities and tokens.
- Keep motion subtle; guard animations under reduced motion.

## State
- Keep local UI state in components; lift only when needed.
- Use Zustand for cross‑route preferences; avoid storing large datasets globally.
- Persist lightweight UI prefs in session/local storage; document keys.

## Testing
- Prefer Playwright role/label selectors.
- Avoid brittle text selectors; assert on stable controls.
- Include basic flows for new features where practical.

## Commits & PRs
- Commit messages: present tense, scope first (e.g., "Navbar: add quick stats pill").
- PRs: concise summary, screenshots for UI changes, checklist (build, a11y, docs).

---

Last updated: 2026-01-06
