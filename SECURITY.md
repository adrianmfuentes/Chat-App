# Security

## Reporting a vulnerability

If you find a security issue, please open a private report via GitHub's "Report a vulnerability" feature on this repository instead of a public issue. Include steps to reproduce and the potential impact.

## Measures in place

- **Passwords**: hashed with bcrypt (`bcryptjs`, cost factor 10 by default) before storage. Plaintext passwords are never logged or persisted.
- **Sessions**: stateless JWTs, signed with `JWT_SECRET`. The server refuses to start with `NODE_ENV=production` unless `JWT_SECRET` is explicitly set — the dev default is not usable in production.
- **Transport**: the WebSocket URL is derived from the backend URL's scheme, so `https://` backends automatically get `wss://` (avoids mixed-content blocking and plaintext WS over a TLS-terminated deployment).
- **Rate limiting**: auth endpoints (`/api/auth/register`, `/api/auth/login`) are limited to 20 requests / 15 minutes per IP. WebSocket connections are limited to 10 messages / 10 seconds per connection, to reduce brute-force and spam potential.
- **Input validation**: request bodies are validated with `zod` (usernames restricted to a safe character set, length bounds on usernames/passwords/room names/messages) before touching the database.
- **SQL injection**: all queries use parameterized statements via `better-sqlite3` (`db.prepare(...).run(...)`), never string-concatenated SQL.
- **HTTP headers**: `helmet` is applied to all responses; `X-Powered-By` is disabled.
- **CORS**: restricted to a single configurable origin (`CORS_ORIGIN`) rather than `*`.
- **Request size limits**: JSON bodies are capped at 100kb to reduce trivial DoS via oversized payloads.

## Known trade-offs

- JWTs cannot be revoked before expiry (stateless by design). `JWT_EXPIRES_IN` defaults to 24h — shorten it if your threat model requires faster revocation, or add a token-blacklist table if you need real-time revocation.
- There is no email verification or password-reset flow. Anyone can register any available username with any password meeting the length rule.
- SQLite has no built-in encryption at rest. If you need that, put the volume on an encrypted disk or switch to a database that supports it natively.
