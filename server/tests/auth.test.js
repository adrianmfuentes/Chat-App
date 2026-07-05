require('./setup');
const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('alice');
  });

  it('rejects duplicate usernames', async () => {
    await request(app).post('/api/auth/register').send({ username: 'bob', password: 'password123' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'bob', password: 'password123' });

    expect(res.status).toBe(409);
  });

  it('rejects short passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'carol', password: 'short' });

    expect(res.status).toBe(400);
  });

  it('rejects invalid usernames', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'a b!', password: 'password123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({ username: 'dave', password: 'password123' });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'dave', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'dave', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('rejects unknown username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ghost', password: 'password123' });

    expect(res.status).toBe(401);
  });
});
