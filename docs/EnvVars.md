# Environment Variables (Vite)

How environment variables work in the frontend (Vite + React), what gets exposed, and safe usage patterns.

## Key rules
- Only variables prefixed with `VITE_` are exposed to the client at build time.
- Access via `import.meta.env.VITE_SOMETHING` in code.
- Do NOT put secrets in the frontend; anything in `VITE_*` is public.

## Files and precedence
Vite loads `.env` files based on mode. Typical files (later overrides earlier):
- `.env` — base defaults for all modes
- `.env.local` — local overrides (ignored by Git, keep secrets out of repo)
- `.env.development`, `.env.production` — mode‑specific defaults
- `.env.development.local`, `.env.production.local` — local overrides per mode (ignored by Git)

Example gitignore policy (already common): do not commit `*.local` env files.

## Reading envs
```
// Safe access with default
const apiBase = import.meta.env.VITE_API_BASE || '/api'
const isDemo = import.meta.env.VITE_DEMO === 'true'
```

## Sample `.env.example`
```
# Public (exposed to browser)
VITE_API_BASE=/api
VITE_FEATURE_EXPORT_PREVIEW=true
VITE_BRAND_ACCENT=#3B82F6

# Private (do NOT prefix with VITE_ and do NOT use in frontend)
# API_SECRET=...   # server-only
```

Copy `.env.example` to `.env` and adjust locally. For machine‑specific values, use `.env.local`.

## Common patterns
- API base URL
  - `VITE_API_BASE=https://api.yourcase.in` → used by a shared axios instance.
- Feature flags (build‑time)
  - `VITE_FEATURE_*` as strings (`'true'/'false'`); gate optional UI.
- Theming
  - `VITE_BRAND_ACCENT` → set a CSS variable at app boot.

## Do / Don’t
- Do: read with fallbacks and coerce to the right type.
- Do: document expected vars in `.env.example` and this doc.
- Don’t: store secrets in `VITE_*` variables.
- Don’t: assume envs change at runtime — Vite inlines them at build time.

## Injecting values in CSS/JS
- JS: use `import.meta.env.VITE_*` directly.
- CSS variables: assign once at startup, e.g., to `:root { --accent-color: <value>; }`.

## Mode tips
- `npm run dev` → development mode; loads `.env.development*` then overrides.
- `npm run build` → production mode; loads `.env.production*` then overrides.

## Troubleshooting
- Variable undefined
  - Ensure it starts with `VITE_`, matches file precedence, and restart dev server after changes.
- Different behavior in prod
  - Confirm `.env.production*` and CI/CD envs are configured; verify bundle contains expected constants.

