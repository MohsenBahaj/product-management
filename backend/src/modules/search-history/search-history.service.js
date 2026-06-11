const { query } = require('../../config/database');

const getAll = async (userId, limit = 20) => {
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit) || 20));
  const result = await query(
    `SELECT id, user_id, search_term, searched_at
     FROM search_history
     WHERE user_id = $1
     ORDER BY searched_at DESC
     LIMIT $2`,
    [userId, safeLimit]
  );
  return result.rows;
};

// Called fire-and-forget from products controller. Silently deduplicates within 1 hour.
const save = async (userId, searchTerm) => {
  const recent = await query(
    `SELECT id FROM search_history
     WHERE user_id = $1 AND search_term = $2
       AND searched_at > NOW() - INTERVAL '1 hour'`,
    [userId, searchTerm]
  );

  if (recent.rows.length > 0) return;

  await query(
    'INSERT INTO search_history (user_id, search_term) VALUES ($1, $2)',
    [userId, searchTerm]
  );
};

const clearAll = async (userId) => {
  await query('DELETE FROM search_history WHERE user_id = $1', [userId]);
};

module.exports = { getAll, save, clearAll };
