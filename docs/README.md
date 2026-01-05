# YourCase Web — Documentation Index

Welcome to the YourCase web client docs. This index links to the most relevant guides and references.

## Getting Started
- Project overview: [Root README](../README.md)
- Frontend quick start: [frontend/README](../frontend/README.md)
- Contributing: [CONTRIBUTING.md](../CONTRIBUTING.md)
- Changelog: [CHANGELOG.md](../CHANGELOG.md)

## Guides
- Architecture Overview: [Architecture.md](./Architecture.md)
- Routing & Error Boundary: [RoutingBoundary.md](./RoutingBoundary.md)
- Recent Toasts Quick View: [QuickView.md](./QuickView.md)
- CSV Import Mapping (user guide): [CSVMapping.md](./CSVMapping.md)
- CSV Import Mapping Specification: [CSVMappingSpec.md](./CSVMappingSpec.md)
- Diagnostics & Telemetry: [Diagnostics.md](./Diagnostics.md)
- Accessibility & Reduced Motion: [Accessibility.md](./Accessibility.md)
- Troubleshooting: [Troubleshooting.md](./Troubleshooting.md)

## Assets
- Screenshots/GIFs live in [docs/assets/](./assets/) — drop files there and reference them from the guides.

## How to run (frontend)
```
cd ../frontend
npm install
npm run dev   # http://localhost:5173
npm run build # outputs to dist/
```

## Notes
- Reduced‑motion is respected across new animations and skeletons.
- Session/Local storage keys are listed in the READMEs and feature guides.
