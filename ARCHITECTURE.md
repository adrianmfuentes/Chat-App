# Architecture

## Overview

```
┌─────────────────┐        HTTPS/REST         ┌──────────────────┐
│                  │ ────────────────────────> │                  │
│  React frontend  │                            │  Express backend │
│  (CRA, antd)     │ <──────────────────────── │  (Node.js)       │
│                  │        WebSocket           │                  │
└─────────────────┘ <────────────────────────> └────────┬─────────┘
                                                          │
                                                          ▼
                                                  ┌───────────────┐
                                                  │ SQLite (WAL)  │
                                                  └───────────────┘
```

The frontend and backend are two separately deployable processes (and two separate Docker images). They only communicate over the network — REST for auth/room management, WebSocket for live chat — never by importing each other's code.

## Frontend (`frontend/`)

- **Create React App** (`react-scripts`) + **antd** for UI components + **react-router-dom** for routing.
- `src/AuthContext.js` holds auth state (JWT + username) in React context, backed by `localStorage` so a page refresh doesn't log the user out. It's the single source of truth for "is the user logged in" — `ProtectedRoute` reads from it to guard `/rooms`, `/createChatRoom`, and `/chat/:roomId`.
- `src/api.js` is a thin `fetch` wrapper for the REST endpoints. It attaches the `Authorization: Bearer <token>` header when a token is passed in.
- `src/Components/ChatRoomComp.js` owns the WebSocket connection for a single room: it fetches message history over REST on mount, then opens a `WebSocket` to `wss://<backend>/ws?token=...&roomId=...` for live updates. The socket is closed on unmount (route change) to avoid leaking connections.
- `src/Globals.js` derives the WebSocket URL from `REACT_APP_BACKEND_URL` (swapping `http`→`ws`) so a single env var controls both, and `wss://` is used automatically when the backend is served over `https://` (avoids mixed-content blocking in production).

## Backend (`server/`)

- **Express** for REST (`src/app.js`, `src/routes/*.js`).
- **`ws`** for the WebSocket server, attached to the same HTTP server (`src/ws.js`), so both REST and WebSocket traffic share one port.
- **better-sqlite3** for persistence (`src/db.js`) — synchronous, embedded, zero extra infrastructure to run. Schema: `users`, `rooms`, `messages` (see [API.md](./API.md) for shapes).
- **JWT** (`src/auth.js`) for stateless auth. A token is issued on register/login and must be presented on every REST call (`Authorization: Bearer`) and on the WebSocket handshake (`?token=`).
- Passwords are hashed with **bcryptjs** before being stored; plaintext passwords never touch the database.

### Request flow: sending a chat message

1. Client has already authenticated (has a JWT) and joined a room's page, which opened a WebSocket connection carrying `token` and `roomId` as query params.
2. `ws.js` verifies the token and confirms the room exists before accepting the connection into that room's client set.
3. On `ws.send({text})`, the server re-validates the payload (length, rate limit per-connection), persists the message row, and broadcasts it to every socket currently in that room.
4. Other clients in the room receive the message over their already-open sockets and append it to their message list.

Message history (for clients who just joined) is fetched separately over REST (`GET /api/rooms/:id/messages`) rather than replayed over the socket, keeping the WebSocket protocol simple (it only ever carries live events).

## Why these choices

- **SQLite over a hosted DB**: this app's scope doesn't need a separate database service to operate or deploy. It's an intentional trade-off — see the "Known limitations" note in the README about horizontal scaling.
- **Raw `ws` over Socket.IO**: no need for Socket.IO's fallback transports or rooms abstraction; a plain `Map<roomId, Set<WebSocket>>` is enough and keeps the dependency surface small.
- **JWT over server-side sessions**: stateless auth means the backend doesn't need shared session storage, which matters if it's ever run as multiple replicas (though SQLite itself would still need addressing first, see above).
