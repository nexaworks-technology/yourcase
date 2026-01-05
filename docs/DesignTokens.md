# Design Tokens Reference

A compact reference of the core tokens used across the UI and how to apply them with Tailwind utilities.

Note: Tailwind default tokens are used with a few project conventions and one custom color (`accent`) from a CSS variable.

## Colors
| Token | Light | Dark | Usage | Tailwind examples |
|---|---|---|---|---|
| text-primary | `#111827` (gray-900) | `#F3F4F6` (gray-100) | Main text | `text-gray-900 dark:text-gray-100` |
| text-secondary | `#4B5563` (gray-600) | `#9CA3AF` (gray-400) | Secondary text, hints | `text-gray-600 dark:text-gray-400` |
| surface | `#FFFFFF` | `#0F172A` (slate-950) | Page background | `bg-white dark:bg-slate-950` |
| panel | `#1F2937` (slate-800) | same | Cards, inputs | `bg-slate-800` |
| border | `#E5E7EB` (slate-200) | `#334155` (slate-700) | Dividers, inputs | `border-slate-200 dark:border-slate-700` |
| accent | `var(--accent-color)` | same | Highlights, links | `text-accent`, `bg-accent`, `border-accent` |

Tip: `accent` is defined via Tailwind extension (see `frontend/tailwind.config.js`), mapped to `--accent-color` so you can theme it centrally.

## Spacing
- Use Tailwind spacing scale (`0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 10, ...`).
- Common gutters: `gap-3` (12px), `gap-4` (16px), `gap-6` (24px).
- Container padding: `px-4 py-3` (12–16px), headers often `px-10 py-4`.

## Typography
| Token | Tailwind | Typical usage |
|---|---|---|
| heading-xl | `text-4xl font-semibold` | Page titles |
| heading-md | `text-lg font-semibold` | Section titles |
| body | `text-sm` | Dense UI content |
| body-lg | `text-base` | Main content |
| label | `text-xs font-medium` | Badges, meta |

Prefer semantic tokens in components (e.g., “heading”, “body”) and map to Tailwind utilities.

## Radius & Shadows
- Corners: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px)
- Cards/inputs typically use `rounded-lg` to `rounded-2xl`
- Shadows: `shadow-sm`, `shadow` sparingly; dark mode often uses borders instead of heavy shadows

## Breakpoints (Tailwind defaults)
| Breakpoint | Min width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

Examples:
- Mobile-first styles default; enhance with `sm:`, `md:`, `lg:` modifiers
- Responsive stack → grid: `grid grid-cols-1 md:grid-cols-2`

## Motion
- Use lightweight transitions: `transition-colors`, `transition-opacity`, durations `duration-150/200/300`.
- Avoid layout-thrashing animations; prefer transforms.
- Respect reduced motion: ensure animated elements degrade under `@media (prefers-reduced-motion: reduce)` (see `src/styles`).

## Z-index (guideline)
| Layer | Class |
|---|---|
| Header/menus | `z-30`–`z-40` |
| Modals/popovers | `z-50`+ |
| Toasts/portals | portal-managed (ensure above modals if needed) |

## Usage patterns
- Text + surface: `text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-950`
- Panel: `bg-slate-800 border border-slate-700 rounded-lg`
- Accent: `text-accent hover:opacity-90`

## Extending tokens
- Add new tokens in `frontend/tailwind.config.js` under `theme.extend` (e.g., `brand`, `warning`).
- Prefer CSS variables for values that swap per theme; map to Tailwind extended colors.
- Document new tokens here with name, purpose, and example utilities.

