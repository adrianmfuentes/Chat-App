# API Reference

Base URL: `REACT_APP_BACKEND_URL` (default `http://localhost:4000`).

All request/response bodies are JSON unless noted. Authenticated endpoints require:

```
Authorization: Bearer <jwt>
```

## Auth

### `POST /api/auth/register`

Create a new account.

Request body:
```json
{ "username": "alice", "password": "password123" }
```
- `username`: 3-24 chars, letters/numbers/underscore only
- `password`: 8-200 chars

Responses:
- `201` — `{ "token": "...", "user": { "id": "...", "username": "alice" } }`
- `400` — validation error
- `409` — username already taken
- `429` — rate limited (20 requests / 15 min per IP)

### `POST /api/auth/login`

Request body: `{ "username": "alice", "password": "password123" }`

Responses:
- `200` — `{ "token": "...", "user": { "id": "...", "username": "alice" } }`
- `401` — invalid username or password
- `429` — rate limited

### `POST /api/auth/logout`

No-op endpoint (JWTs are stateless, nothing to invalidate server-side). Exists so the frontend can signal disconnect via `navigator.sendBeacon()` on page unload. Always returns `204`.

## Rooms

All room endpoints require `Authorization: Bearer <token>`.

### `GET /api/rooms`

List all rooms, most recently created first.

Response: `200` — `{ "rooms": [{ "id", "name", "createdAt", "createdBy" }] }`

### `POST /api/rooms`

Create a room.

Request body: `{ "name": "general" }` (3-40 chars)

Responses:
- `201` — `{ "id", "name", "createdBy" }`
- `400` — validation error
- `409` — a room with that name already exists

### `GET /api/rooms/:id/messages?limit=50`

Message history for a room, oldest first. `limit` defaults to 50, capped at 200.

Responses:
- `200` — `{ "messages": [{ "id", "userId", "username", "text", "createdAt" }] }`
- `404` — room not found

## WebSocket

Connect to:

```
ws(s)://<backend>/ws?token=<jwt>&roomId=<roomId>
```

The connection is rejected (close code `1008`) if the token is missing/invalid or the room doesn't exist.

### Client → server

```json
{ "text": "hello room" }
```
- `text`: 1-2000 chars after trimming
- Rate-limited to 10 messages / 10 seconds per connection; excess sends get back a `type: "error"` message and are dropped (not persisted, not broadcast).

### Server → client

Three message shapes, distinguished by `type`:

```json
{ "type": "message", "id", "roomId", "userId", "username", "text", "createdAt" }
{ "type": "system", "text": "alice joined the room", "timestamp" }
{ "type": "error", "text": "Message must be 1-2000 characters" }
```

`system` messages are broadcast on join/leave. `error` messages are sent only to the client that caused them, never broadcast.
