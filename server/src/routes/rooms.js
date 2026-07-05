const express = require('express');
const crypto = require('node:crypto');
const { z } = require('zod');
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

const roomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Room name must be at least 3 characters')
    .max(40, 'Room name must be at most 40 characters'),
});

router.get('/', (req, res) => {
  const rooms = db
    .prepare(
      `SELECT rooms.id, rooms.name, rooms.created_at, users.username AS created_by
       FROM rooms JOIN users ON users.id = rooms.created_by
       ORDER BY rooms.created_at DESC`
    )
    .all();
  res.json({ rooms });
});

router.post('/', (req, res) => {
  const parsed = roomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { name } = parsed.data;

  const existing = db.prepare('SELECT id FROM rooms WHERE name = ?').get(name);
  if (existing) {
    return res.status(409).json({ error: 'A room with that name already exists' });
  }

  const id = crypto.randomUUID();
  db.prepare('INSERT INTO rooms (id, name, created_by) VALUES (?, ?, ?)').run(
    id,
    name,
    req.user.sub
  );
  res.status(201).json({ id, name, createdBy: req.user.username });
});

router.get('/:id/messages', (req, res) => {
  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const messages = db
    .prepare(
      `SELECT id, user_id AS userId, username, text, created_at AS createdAt
       FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .all(req.params.id, limit)
    .reverse();

  res.json({ messages });
});

module.exports = router;
