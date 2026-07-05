# Chat App

A real-time chat application: React frontend + a Node.js/Express/WebSocket backend with JWT auth and SQLite persistence.

> This project started as a UI-only prototype with a fake login and no server. It has since been rebuilt into a working full-stack app — see [ARCHITECTURE.md](./ARCHITECTURE.md) for how the pieces fit together and [CHANGELOG.md](./CHANGELOG.md) for what changed.

## Features

- Username/password registration and login (bcrypt-hashed passwords, JWT sessions)
- Create and browse chat rooms
- Real-time messaging over WebSocket, with message history persisted in SQLite
- Rate limiting on auth endpoints and on WebSocket message sends (basic spam/abuse protection)
- i18n support for 10 languages (English, Spanish, French, German, Italian, Polish, Russian, Chinese, Hindi, Arabic)
- Dockerized (frontend + backend), with docker-compose for one-command local startup
- CI (GitHub Actions): lint, test, and build for both frontend and backend, plus a Docker build check

## Project structure

```
.
├── frontend/             # React frontend (Create React App)
│   ├── src/
│   ├── public/
│   └── Dockerfile        # Frontend image (multi-stage, served by nginx)
├── server/               # Node/Express/WebSocket backend
│   ├── src/
│   ├── tests/
│   └── Dockerfile        # Backend image
├── docker-compose.yml
└── .github/workflows/    # CI
```

## Quick start (Docker)

The fastest way to run the whole stack:

```bash
cp .env.example .env
# edit .env and set a real JWT_SECRET
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:4000

## Quick start (local development, no Docker)

Requires Node.js 20+.

**Backend:**

```bash
cd server
cp .env.example .env
npm install
npm run dev        # starts on http://localhost:4000
```

**Frontend** (in a separate terminal):

```bash
cd frontend
cp .env.example .env
npm install
npm start           # starts on http://localhost:3000
```

## Scripts

**Frontend** (`frontend/`):

| Command | Description |
|---|---|
| `npm start` | Start the dev server |
| `npm run build` | Production build to `build/` |
| `npm test` | Run tests once (non-watch) |
| `npm run test:watch` | Run tests in watch mode |

**Backend** (`server/`):

| Command | Description |
|---|---|
| `npm run dev` | Start with auto-restart on file changes |
| `npm start` | Start the server |
| `npm test` | Run the Jest test suite |
| `npm run lint` | Run ESLint |

## Configuration

See [.env.example](./.env.example) (docker-compose), [frontend/.env.example](./frontend/.env.example), and [server/.env.example](./server/.env.example) for all available environment variables.

The important one to change before any real deployment: `JWT_SECRET`. The server refuses to start in production (`NODE_ENV=production`) without one set explicitly.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — how the frontend, backend, and WebSocket layer fit together
- [API.md](./API.md) — REST and WebSocket API reference
- [SECURITY.md](./SECURITY.md) — security measures and how to report a vulnerability
- [CONTRIBUTING.md](./CONTRIBUTING.md) — how to contribute
- [CHANGELOG.md](./CHANGELOG.md) — notable changes, including the fixes made to the original prototype

## Known limitations

- `react-scripts` (Create React App) is no longer actively maintained, which is why `npm audit` reports vulnerabilities in its build-time dependency tree (webpack loaders, etc.). These affect the local dev/build tooling only, not code shipped to the browser. Migrating to Vite is a reasonable future improvement but was out of scope for this pass.
- SQLite is used for simplicity; it's fine for small deployments but a single-writer database won't scale past one backend instance. Swap `server/src/db.js` for a networked database (Postgres, etc.) if you need to run multiple backend replicas.
