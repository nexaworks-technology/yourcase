# Deploy Targets Cookbook

Ready-to-use snippets for deploying the YourCase frontend (Vite + React) as a static site.

## Table of Contents
- Netlify
- Vercel (static)
- Nginx
- GitHub Pages
- CloudFront + S3
- Subpaths
- Common pitfalls

Important: enable SPA fallback to `index.html` for client-side routing.

## Netlify
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Add `_redirects` file to `frontend/public/` or root of `dist/`:
```
/*  /index.html  200
```
- netlify.toml (optional):
```
[build]
  command = "npm run build"
  publish = "frontend/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Vercel (static)
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `frontend/dist`
- vercel.json (optional):
```
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Nginx
- Serve `frontend/dist` and add SPA fallback:
```
server {
  listen 80;
  server_name your.domain.com;
  root /var/www/yourcase/frontend/dist;

  location / {
    try_files $uri /index.html;
  }

  location ~* \.(js|css|png|jpg|svg|woff2?)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

## GitHub Pages
- Build: `npm run build` → `frontend/dist`
- If deploying to `https://<user>.github.io/<repo>/`, set base path in `frontend/vite.config.js`:
```
export default defineConfig({
  base: '/<repo>/',
  plugins: [react()],
})
```
- Publish `dist` to `gh-pages` branch (e.g., with `gh-pages` npm package or GitHub Action).
- GitHub Action example:
```
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-deploy:
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
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ycweb/frontend/dist
```

## CloudFront + S3
- Upload `frontend/dist` to an S3 bucket (static website hosting optional).
- CloudFront behavior:
  - Origin: S3 bucket
  - Default Root Object: `index.html`
  - Error responses: map 403/404 to `/index.html` with 200 for SPA fallback.
- Add long-cache for `*.js,*.css` and shorter for HTML.

## Subpaths
- If serving under `/app/`, set `base: '/app/'` in `vite.config.js` and ensure rewrites respect the subpath on the host.

### Hash vs History routing
- If your hosting cannot provide SPA rewrites, consider hash routing to avoid server rewrites:
  - Switch Router to `HashRouter` in React Router, and deploy without `_redirects`.
  - URLs become `/#/path` and work on static hosts without custom rewrites.
- Prefer History routing with proper fallback when possible (cleaner URLs, better analytics).

## SPA fallback checklist
- Ensure all deep links (e.g., `/settings`, `/matters/123`) resolve to `index.html` on the host.
- Netlify: `_redirects` contains `/*  /index.html  200` in `dist/`.
- Vercel: add a `rewrites` rule to `index.html` when using static export.
- Nginx: `try_files $uri /index.html;` in the main `location /` block.
- CloudFront: map 403/404 to `/index.html` with status 200.
- GitHub Pages: set `base` in `vite.config.js` to repo subpath and serve `dist` on `gh-pages`.
- Verify locally: run `npx serve frontend/dist` and test deep links.

## Common pitfalls
- White screen on deep links: SPA fallback missing → add rewrites/try_files.
- Broken assets on subpath: `base` not set → set `base` to the deploy path.
- Mixed content: ensure HTTPS and absolute asset URLs match the site origin.
