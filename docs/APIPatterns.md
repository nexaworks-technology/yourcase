# API and Service Patterns

Guidelines for HTTP calls, error handling, downloads, and consistency across services.

## Goals
- Single axios instance with sensible defaults (baseURL/headers/timeout).
- Consistent error shape returned to UI.
- Safe file downloads (blob) with filename extraction.
- Abortable requests and retry strategy when appropriate.

## Axios instance
Create one instance and reuse it in services.

```
// src/services/api.js
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 20000,
  withCredentials: false,
})

// Optional: request/response interceptors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Normalize common error shape
    const status = err.response?.status || 0
    const data = err.response?.data
    const message = data?.message || err.message || 'Request failed'
    return Promise.reject({ status, message, data, original: err })
  }
)
```

Notes
- Prefer importing `api` instead of `axios` directly in services.
- Keep interceptors light; avoid side effects (toasts) in the transport layer.

## Service functions
Prefer small, focused functions that return plain data and throw normalized errors.

```
// src/services/matterService.js
import { api } from './api'

export async function listMatters({ q, page = 1, pageSize = 20, signal } = {}) {
  const res = await api.get('/matters', { params: { q, page, pageSize }, signal })
  return res.data
}

export async function getDocument({ id, signal }) {
  const res = await api.get(`/documents/${id}`, { signal })
  return res.data
}
```

## Error normalization (UI)
UI code should expect `{ status, message, data, original }` when a request fails.

```
import { announce } from '../components/ui/LiveAnnouncer'

try {
  const items = await listMatters({ q })
  // ...
} catch (e) {
  announce(e.message || 'Failed to load matters', { toast: { variant: 'error' } })
}
```

## Abort/cancel requests
Use `AbortController` for debounced searches or route changes.

```
const ac = new AbortController()
listMatters({ q, signal: ac.signal })
// later: ac.abort()
```

Axios 1+ accepts `signal` on requests; do not mix with legacy `CancelToken`.

## Timeouts and retries
- Default timeout: 20s on the instance.
- Retries: do not retry POST by default. For GET, consider a simple capped retry with small backoff in the caller when value is high.

```
async function getWithRetry(fn, { attempts = 2, delay = 300 } = {}) {
  let last
  for (let i = 0; i <= attempts; i++) {
    try { return await fn() } catch (e) { last = e }
    await new Promise(r => setTimeout(r, delay * (i + 1)))
  }
  throw last
}
```

## File downloads (blob)
Download as blob and infer filename from `Content-Disposition`.

```
export async function downloadFile(url, { params, filename, signal } = {}) {
  const res = await api.get(url, { params, responseType: 'blob', signal })
  const blob = res.data
  let name = filename
  const cd = res.headers['content-disposition']
  if (!name && cd) {
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd)
    name = decodeURIComponent(m?.[1] || m?.[2] || 'download')
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name || 'download'
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(a.href)
  a.remove()
}
```

Tips
- For large blobs, show progress UI (axios onDownloadProgress) and disable actions while downloading.
- Always revoke object URLs.

## CSV/JSON uploads
Use `multipart/form-data` for files or JSON when server expects raw JSON.

```
export async function uploadCSV(file, { signal } = {}) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/import/csv', form, { signal })
  return res.data
}
```

## Pagination and filtering
- Accept `{ page, pageSize, q, sort }` parameters; pass via `params`.
- Return `{ items, total, page, pageSize }` so UI can paginate consistently.

## Caching
- For simple caching, let callers memoize by key or use a small SWR-style hook.
- Avoid hidden global caches inside services unless clearly documented.

## Security & hygiene
- Never interpolate untrusted HTML. Sanitize if you must render rich content.
- Prefer server-driven downloads over client-building untrusted files.
- Keep auth concerns separate; if adding tokens, add an auth interceptor that reads from a safe store and refreshes tokens explicitly.

## When to use fetch
- Small one-offs or static JSON loads can use `fetch`. For consistency and interceptors, prefer `api`.

## Migration notes
- Unify any mixed `import axios from 'axios'` with the shared `api` instance.
- Ensure blob downloads set `responseType: 'blob'` (example: `matterService.js` for attachments).
- Avoid re-exporting lazily imported services to silence Vite warnings.

