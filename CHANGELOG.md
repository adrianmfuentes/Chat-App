# Changelog

## Unreleased — rebuild from prototype to working app

The project started as a frontend-only prototype: no backend existed at all, despite the UI calling one. This pass added the missing backend and fixed the bugs that surfaced once real requests started flowing.

### Added

- Full backend (`server/`): Express REST API + WebSocket server, JWT auth, bcrypt password hashing, SQLite persistence, rate limiting, input validation, Jest/Supertest test suite.
- Real registration flow (`/register` route + `RegisterComp`) — previously login was the only entry point and "Register" links went nowhere.
- Room list (`RoomListComp`, `/rooms`) — previously there was no way to see or choose a room; "Join Chat Room" led to a single hardcoded chat with no room concept.
- `AuthContext` for centralized auth state, replacing a `login` boolean passed down as a prop.
- `ProtectedRoute` guarding room/chat pages — previously any route was reachable without logging in.
- Message history endpoint so joining a room shows prior messages instead of starting blank.
- Docker images for both frontend (nginx) and backend, plus `docker-compose.yml`.
- GitHub Actions CI: lint + test + build for both apps, plus a Docker build check.
- i18n coverage for all UI strings across 10 locales (previously the translation file was leftover copy from an unrelated "TaskMaster" project and didn't cover any chat UI text).

### Fixed

- **Fake authentication**: login previously accepted any non-empty username/password and stored a hardcoded string as the "API key." Replaced with real credential verification against hashed passwords.
- **`react-scripts` version was `^0.0.0`** in `package.json` — an invalid version that could resolve to a broken/ancient package. Pinned to `^5.0.1`.
- **`beforeunload` handler used `await fetch(...)`**: browsers do not wait for async work in `beforeunload`, so the disconnect call silently failed to send in most cases. Replaced with `navigator.sendBeacon()`, which is designed for this exact use case.
- **Stale closure bug in `App.js`**: the `beforeunload` effect read `apiKey` once at mount (empty dependency array) and never saw a token set after that — so logging in after the initial page load meant disconnect-on-close never fired. Fixed by reading the token from `localStorage` at unload time instead of capturing it in a closure.
- **`ChatRoomComp` connected to a hardcoded `ws://localhost:4000`**, ignoring the configured backend URL and always using an insecure scheme. Now derives the WebSocket URL from `REACT_APP_BACKEND_URL`, upgrading to `wss://` automatically for `https://` backends.
- **`ChatRoomComp` could crash sending on a socket that wasn't open yet** (no `readyState` check). Send is now a no-op while the socket isn't `OPEN`, and the input/button are disabled until connected.
- **`CreateChatRoomComp` never talked to a server** — it just navigated to the chat screen regardless of whether a room existed. Now calls the real create-room endpoint and only navigates on success.
- **Deprecated antd `Menu`/`Dropdown` `overlay` prop** — replaced with the `items`/`menu` APIs to remove console warnings and match antd v5's supported usage.
- **Leftover branding**: the footer read "Task Master ©2024" and the Terms of Service referenced "our To Do List website" — both remnants of a different project. Corrected to Chat App.
- Disconnect requests previously sent the API key as a URL query parameter (`?apiKey=...`), which ends up in server access logs. The new auth model uses a signed JWT in the `Authorization` header for authenticated requests instead.
