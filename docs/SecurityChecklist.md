# Security Checklist

Table of Contents
- Content & rendering
- Downloads & blobs
- HTTP & services
- Secrets & environment
- Dependencies
- Storage & privacy
- XSS/Injection
- Navigation & routing
- File handling (uploads)
- Build & supply chain
- Logging & diagnostics
- Reviews & PRs

Baseline practices to keep the YourCase web client safe and maintainable.

[← Back to docs index](./README.md)

## Content & rendering
- Never inject untrusted HTML. Prefer text content; sanitize if rich HTML is required.
- Avoid `dangerouslySetInnerHTML` unless strictly necessary and sanitized.
- Validate and constrain file inputs (type/size) before processing.

## Downloads & blobs
- Always use `responseType: 'blob'` for file downloads; do not derive content from untrusted strings.
- Extract filenames from `Content-Disposition` safely and fall back to a default.
- Revoke object URLs after use to avoid leaks.

## HTTP & services
- Centralize HTTP via a shared axios instance; normalize errors.
- Timeouts: set reasonable defaults (e.g., 20s) and expose abort via `AbortController`.
- Retries: do not retry non‑idempotent requests (e.g., POST) automatically.

## Secrets & environment
- Do not commit secrets. Use `.env` with `VITE_` prefixes for client‑safe values only.
- Never embed private keys or server credentials in frontend code.
- Document required envs and defaults.

## Dependencies
- Keep dependencies up to date; remove unused packages.
- Prefer well‑maintained libraries. Review license/health before adding new deps.
- Lockfile should be committed; use `npm ci` in CI for reproducibility.

## Storage & privacy
- Store only UI preferences in `sessionStorage`/`localStorage` per docs; avoid PII.
- Namespaced keys (e.g., `yc_*`) and document schema in Storage Keys reference.
- Provide clear reset paths (UI + DevTools snippets) for users and devs.

## XSS/Injection
- Treat all external data as untrusted; escape when displaying.
- Avoid constructing URLs from untrusted input without encoding.
- Do not pass untrusted strings into CSS className without validation.

## Navigation & routing
- Use client‑side routing; ensure SPA fallback to `index.html` in deploys.
- Avoid open redirects (do not redirect to arbitrary external URLs derived from query params).

## File handling (uploads)
- Limit accepted MIME types and size before reading client‑side.
- Use `FileReader`/`URL.createObjectURL` carefully; revoke URLs after use.

## Build & supply chain
- Verify build artifacts; do not run arbitrary postinstall scripts.
- For CI, pin Node LTS and use `npm ci`. Consider vulnerability scans in CI.

## Logging & diagnostics
- Do not log sensitive content in production. Scope retry telemetry to session and allow clearing/exporting.
- Redact identifiers if telemetry is ever exported.

## Reviews & PRs
- Include security impact in PR descriptions when adding new deps/features.
- Request a second review for code paths that touch downloads/uploads or dynamic rendering.

---

Last updated: 2026-01-06
