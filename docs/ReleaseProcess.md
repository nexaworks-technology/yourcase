# Release Process

A lightweight process for shipping stable changes to the YourCase web client.

## Versioning
- Use semantic versioning (MAJOR.MINOR.PATCH)
  - PATCH: bug fixes and docs only changes
  - MINOR: new features that are backwards‑compatible
  - MAJOR: breaking changes or notable redesigns
- Tag format: `vX.Y.Z`

## Branching
- Work on feature branches from `main` (Portal sessions use `portalcode`).
- Keep branches focused; rebase/merge main frequently to avoid drift.

## PR checklist
- Builds locally: `cd frontend && npm ci && npm run build`
- No regressions in desktop UI, basic mobile responsiveness intact
- Accessibility respected (reduced motion, keyboard navigation)
- Docs updated (README and docs/ as needed)
- Changelog entry added (see below)
- Screenshots/GIFs for visible UI changes

## Changelog
- File: `CHANGELOG.md`
- Entry format:
```
### YYYY‑MM‑DD
- Area: short, user‑facing summary of change
```
- Group multiple small items under the same date when shipping together.

## Tagging & release
1) Merge PR to `main`
2) Update `CHANGELOG.md` with final summaries (if not already)
3) Create a tag and push
```
# from main
npm --prefix frontend -s run build
git tag vX.Y.Z -m "YourCase web vX.Y.Z"
git push origin vX.Y.Z
```
4) Create a GitHub Release with notes (paste relevant CHANGELOG items)

## Hotfixes
- Branch from the release tag (or main if identical), apply patch, bump PATCH version, retag, and release.

## Rollback
- Revert the merge commit on main or redeploy a prior tag; document the reason in the next release notes.

## Automation (optional)
- Add a CI workflow to build on tag push and attach `frontend/dist` as an artifact.
- Optional: auto‑publish to your hosting platform on tagged builds.

