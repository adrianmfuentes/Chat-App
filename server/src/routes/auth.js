const express = require('express');
const crypto = require('node:crypto');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const db = require('../db');
const { hashPassword, verifyPassword, signToken } = require('../auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(24, 'Username must be at most 24 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

router.post('/register', authLimiter, async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { username, password } = parsed.data;

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)').run(
    id,
    username,
    passwordHash
  );

  const user = { id, username };
  const token = signToken(user);
  res.status(201).json({ token, user });
});

router.post('/login', authLimiter, async (req, res) => {
  const parsed = credentialsSchema.pick({ username: true, password: true }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid username or password' });
  }
  const { username, password } = parsed.data;

  const row = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);
  if (!row) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const user = { id: row.id, username: row.username };
  const token = signToken(user);
  res.json({ token, user });
});

// JWTs are stateless, so there is nothing to invalidate server-side. This
// endpoint exists so the client can reliably signal disconnect via
// navigator.sendBeacon() during page unload (fetch() during unload is not
// guaranteed to complete). It always succeeds.
router.post('/logout', (req, res) => {
  res.status(204).end();
});

module.exports = router;
