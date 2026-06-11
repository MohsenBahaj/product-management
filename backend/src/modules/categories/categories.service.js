const { query } = require('../../config/database');
const AppError = require('../../utils/AppError');

const FIELDS =
  'id, user_id, name, description, image_url, is_active, created_at, updated_at';

const getAll = async (userId) => {
  const result = await query(
    `SELECT ${FIELDS}
     FROM categories
     WHERE user_id = $1 AND is_active = TRUE
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getById = async (id, userId) => {
  const result = await query(
    `SELECT ${FIELDS}
     FROM categories
     WHERE id = $1 AND user_id = $2 AND is_active = TRUE`,
    [id, userId]
  );

  if (result.rows.length === 0) throw new AppError('Category not found', 404);
  return result.rows[0];
};

const create = async (userId, { name, description, imageUrl }) => {
  const result = await query(
    `INSERT INTO categories (user_id, name, description, image_url)
     VALUES ($1, $2, $3, $4)
     RETURNING ${FIELDS}`,
    [userId, name.trim(), description || null, imageUrl || null]
  );
  return result.rows[0];
};

const update = async (id, userId, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name.trim()); }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (data.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); values.push(data.imageUrl); }

  if (fields.length === 0) throw new AppError('No fields to update', 400);

  values.push(id, userId);

  const result = await query(
    `UPDATE categories
     SET ${fields.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx} AND is_active = TRUE
     RETURNING ${FIELDS}`,
    values
  );

  if (result.rows.length === 0) throw new AppError('Category not found', 404);
  return result.rows[0];
};

const remove = async (id, userId) => {
  const result = await query(
    `UPDATE categories SET is_active = FALSE
     WHERE id = $1 AND user_id = $2 AND is_active = TRUE
     RETURNING id`,
    [id, userId]
  );

  if (result.rows.length === 0) throw new AppError('Category not found', 404);
};

module.exports = { getAll, getById, create, update, remove };
