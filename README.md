# YourCase Monorepo (Legacy Snapshot)

Simplified scaffold for the legal tech platform. Includes Express backend (minimal routes), React frontend via Vite, and shared documentation.

## Backend Usage

```bash
npm --prefix backend install      # install dependencies
npm --prefix backend run dev      # auto-installs if needed + nodemon with env detection
npm --prefix backend run start    # run once (no watcher)
```

- `.env` lookup order: `backend/.env` → repo root `.env` → parent `.env`.
- Automatic port fallback: defaults to 4000; will try successive ports if busy and log the chosen port.

## Frontend Usage

```bash
npm --prefix frontend install
npm --prefix frontend run dev     # ensures deps, warns if API base misaligned with backend port
npm --prefix frontend run build
```

- Uses `frontend/.env.local` or `VITE_API_BASE_URL` env.
- Warns if backend PORT (from `.env`) doesn’t match API base.

## Structure

```
backend/   Express app (auth, queries, documents, matters)
frontend/  React + Vite UI scaffold
```

## Notes

- This snapshot predates full AI copilot, workflows, and policy modules. Routes/services are placeholders.
- Documentation from later phases resides in `/documentation` (if present in repo).
- MongoDB connection requires `MONGODB_URI` in `.env`.
