const { query } = require('../../config/database');
const AppError = require('../../utils/AppError');

const SAFE_FIELDS =
  'id, name, email, profile_image_url, is_active, created_at, updated_at';

const getProfile = async (userId) => {
  const result = await query(
    `SELECT ${SAFE_FIELDS} FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) throw new AppError('User not found', 404);
  return result.rows[0];
};

const updateProfile = async (userId, { name }) => {
  const result = await query(
    `UPDATE users SET name = $1
     WHERE id = $2
     RETURNING ${SAFE_FIELDS}`,
    [name.trim(), userId]
  );

  if (result.rows.length === 0) throw new AppError('User not found', 404);
  return result.rows[0];
};

// Accepts a fully-qualified public URL (Firebase Storage or any CDN).
const updateProfileImage = async (userId, imageUrl) => {
  const result = await query(
    `UPDATE users SET profile_image_url = $1
     WHERE id = $2
     RETURNING ${SAFE_FIELDS}`,
    [imageUrl, userId]
  );

  if (result.rows.length === 0) throw new AppError('User not found', 404);
  return result.rows[0];
};

module.exports = { getProfile, updateProfile, updateProfileImage };
