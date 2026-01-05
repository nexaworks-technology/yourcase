# Build & Deploy

Short guide to build the YourCase frontend and deploy it as a static site.

## Build
- From `frontend/`:
  - Install deps: `npm install`
  - Production build: `npm run build`
  - Artifacts: `frontend/dist/`

## Preview (local)
- After build: `npx vite preview --open` (defaults to http://localhost:4173)

## Environment variables
- This app currently runs without required secrets by default.
- If you add env vars, use a `.env` file in `frontend/` and reference via `import.meta.env.VITE_*`.

## Static hosting
- Any static host can serve the `dist/` folder (Netlify, Vercel static, S3+CloudFront, Nginx, GitHub Pages).
- Ensure you configure SPA fallback to `index.html` for client-side routing.
  - Netlify: `_redirects` with `/*  /index.html  200`
  - Vercel: framework auto-detect or set routes to fallback to `index.html`
  - Nginx: `try_files $uri /index.html;`

## Base path (optional)
- If serving under a subpath (e.g., `/app/`), set `base` in `vite.config.js`:
```
export default defineConfig({
  base: '/app/',
  plugins: [react()],
})
```

## Continuous Integration (example)
- Minimal GitHub Actions workflow:
```
name: build
on: [push]
jobs:
  web:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ycweb/frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: ycweb/frontend/package-lock.json
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: ycweb/frontend/dist
```

## Caching tips
- Cache `~/.npm` and Vite cache (`node_modules/.vite`) in CI for faster builds.
- Bump cache keys when upgrading Node or dependencies.

## Troubleshooting
- White screen after deploy: check SPA fallback to `index.html` is enabled.
- Broken links under subpaths: set `base` in `vite.config.js` to match deploy path.
- Build failures: verify Node LTS and run `npm ci && npm run build` locally.

