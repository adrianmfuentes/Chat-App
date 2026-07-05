require('./setup');
const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();
let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username: 'erin', password: 'password123' });
  token = res.body.token;
});

describe('rooms API', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(401);
  });

  it('creates and lists a room', async () => {
    const createRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'general' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe('general');

    const listRes = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.rooms).toHaveLength(1);
    expect(listRes.body.rooms[0].name).toBe('general');
  });

  it('rejects duplicate room names', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'general' });

    expect(res.status).toBe(409);
  });

  it('returns empty message history for a new room', async () => {
    const createRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'empty-room' });

    const res = await request(app)
      .get(`/api/rooms/${createRes.body.id}/messages`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.messages).toEqual([]);
  });

  it('404s for a missing room', async () => {
    const res = await request(app)
      .get('/api/rooms/nonexistent-id/messages')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
