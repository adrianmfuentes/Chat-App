require('dotenv').config();

const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  dbPath: process.env.DB_PATH || './data/chat.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  isProd,
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
};
