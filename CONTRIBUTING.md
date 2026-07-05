# Contributing

## Setup

See the "Quick start (local development, no Docker)" section in [README.md](./README.md).

## Before opening a PR

Run both test suites and make sure the frontend still builds:

```bash
# frontend
cd frontend
npm test
npm run build

# backend
cd server
npm run lint
npm test
```

CI runs the same checks (`.github/workflows/ci.yml`) plus a Docker build check, so a green local run is a good predictor of a green PR.

## Conventions

- Frontend components live in `frontend/src/Components/`; page-level CSS lives in `frontend/src/CSS/` (or `frontend/src/Footer/css/` for footer pages), matching the existing pattern — one stylesheet per component, imported directly by that component.
- Backend routes live in `server/src/routes/`, one file per resource. Validation schemas are defined inline with `zod` at the top of each route file.
- Add a translation key to **every** locale block in `frontend/src/i18.js` when adding user-facing text — a key missing from a non-English locale silently falls back to English (via `fallbackLng`), so it won't break the build, but it will leave that locale incomplete.
- New backend endpoints should have a corresponding Jest/Supertest test in `server/tests/`; new frontend components with logic (not pure presentation) should have a React Testing Library test in `frontend/src/Components/__tests__/`.

## Commit messages

Keep the subject line short and focused on *why*, not just *what* — the diff already shows what changed.
