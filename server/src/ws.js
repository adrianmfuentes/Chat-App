const { WebSocketServer } = require('ws');
const crypto = require('node:crypto');
const { URL } = require('node:url');
const db = require('./db');
const { verifyToken } = require('./auth');

const MAX_MESSAGE_LENGTH = 2000;
const MESSAGES_PER_WINDOW = 10;
const WINDOW_MS = 10_000;

function attachWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const roomClients = new Map(); // roomId -> Set<ws>

  const broadcast = (roomId, payload) => {
    const clients = roomClients.get(roomId);
    if (!clients) return;
    const data = JSON.stringify(payload);
    for (const client of clients) {
      if (client.readyState === client.OPEN) client.send(data);
    }
  };

  wss.on('connection', (ws, req) => {
    let url;
    try {
      url = new URL(req.url, 'http://localhost');
    } catch {
      ws.close(1008, 'Invalid request');
      return;
    }

    const token = url.searchParams.get('token');
    const roomId = url.searchParams.get('roomId');

    if (!token || !roomId) {
      ws.close(1008, 'Missing token or roomId');
      return;
    }

    let user;
    try {
      user = verifyToken(token);
    } catch {
      ws.close(1008, 'Invalid or expired token');
      return;
    }

    const room = db.prepare('SELECT id, name FROM rooms WHERE id = ?').get(roomId);
    if (!room) {
      ws.close(1008, 'Room not found');
      return;
    }

    ws.user = user;
    ws.roomId = roomId;
    ws.messageTimestamps = [];

    if (!roomClients.has(roomId)) roomClients.set(roomId, new Set());
    roomClients.get(roomId).add(ws);

    broadcast(roomId, {
      type: 'system',
      text: `${user.username} joined the room`,
      timestamp: new Date().toISOString(),
    });

    ws.on('message', (raw) => {
      const now = Date.now();
      ws.messageTimestamps = ws.messageTimestamps.filter((t) => now - t < WINDOW_MS);
      if (ws.messageTimestamps.length >= MESSAGES_PER_WINDOW) {
        ws.send(JSON.stringify({ type: 'error', text: 'You are sending messages too fast' }));
        return;
      }
      ws.messageTimestamps.push(now);

      let parsed;
      try {
        parsed = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: 'error', text: 'Malformed message' }));
        return;
      }

      const text = typeof parsed.text === 'string' ? parsed.text.trim() : '';
      if (!text || text.length > MAX_MESSAGE_LENGTH) {
        ws.send(JSON.stringify({ type: 'error', text: 'Message must be 1-2000 characters' }));
        return;
      }

      const message = {
        id: crypto.randomUUID(),
        roomId,
        userId: user.sub,
        username: user.username,
        text,
        createdAt: new Date().toISOString(),
      };

      db.prepare(
        'INSERT INTO messages (id, room_id, user_id, username, text) VALUES (?, ?, ?, ?, ?)'
      ).run(message.id, roomId, user.sub, user.username, text);

      broadcast(roomId, { type: 'message', ...message });
    });

    ws.on('close', () => {
      roomClients.get(roomId)?.delete(ws);
      if (roomClients.get(roomId)?.size === 0) roomClients.delete(roomId);
      broadcast(roomId, {
        type: 'system',
        text: `${user.username} left the room`,
        timestamp: new Date().toISOString(),
      });
    });
  });

  return wss;
}

module.exports = { attachWebSocketServer };
