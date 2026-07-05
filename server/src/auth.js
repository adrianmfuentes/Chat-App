const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, bcryptRounds } = require('./config');

const hashPassword = (password) => bcrypt.hash(password, bcryptRounds);
const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

const signToken = (user) =>
  jwt.sign({ sub: user.id, username: user.username }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

const verifyToken = (token) => jwt.verify(token, jwtSecret);

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
