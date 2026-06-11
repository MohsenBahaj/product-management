const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/database');
const config = require('../../config');
const AppError = require('../../utils/AppError');

const SAFE_USER_FIELDS =
  'id, name, email, profile_image_url, is_active, created_at, updated_at';

const generateToken = (userId) =>
  jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const register = async (name, email, password) => {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING ${SAFE_USER_FIELDS}`,
    [name.trim(), email.toLowerCase(), passwordHash]
  );

  return { user: result.rows[0], token: generateToken(result.rows[0].id) };
};

const login = async (email, password) => {
  const result = await query(
    'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
    [email.toLowerCase()]
  );

  // Use the same message for not-found and wrong-password to prevent user enumeration
  if (result.rows.length === 0) {
    throw new AppError('Invalid credentials', 401);
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token: generateToken(user.id) };
};

const getMe = async (userId) => {
  const result = await query(
    `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return result.rows[0];
};

module.exports = { register, login, getMe };
