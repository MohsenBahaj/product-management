const { query } = require('../../config/database');
const AppError = require('../../utils/AppError');
const { getPagination, paginatedData } = require('../../utils/pagination');

const PRODUCT_FIELDS = `
  p.id, p.user_id, p.category_id, p.name, p.description, p.image_url,
  p.thumbnail_image_url, p.price, p.quantity, p.is_active, p.is_featured,
  p.created_at, p.updated_at,
  c.name AS category_name`;

const VALID_SORT = new Set(['created_at', 'price', 'name', 'quantity']);

const MAX_GALLERY = 10;

// ── List ──────────────────────────────────────────────────────────────────────

const getAll = async (userId, queryParams) => {
  const { page, limit, offset } = getPagination(queryParams);
  const { search, categoryId, minPrice, maxPrice, minQuantity, maxQuantity, order = 'desc', featured } = queryParams;
  let { sortBy = 'created_at' } = queryParams;

  if (!VALID_SORT.has(sortBy)) sortBy = 'created_at';
  const safeOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const conditions = ['p.user_id = $1', 'p.is_active = TRUE'];
  const values = [userId];
  let idx = 2;

  if (featured === 'true') conditions.push('p.is_featured = TRUE');

  if (search) {
    conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  if (categoryId) { conditions.push(`p.category_id = $${idx}`); values.push(categoryId); idx++; }
  if (minPrice !== undefined) { conditions.push(`p.price >= $${idx}`); values.push(parseFloat(minPrice)); idx++; }
  if (maxPrice !== undefined) { conditions.push(`p.price <= $${idx}`); values.push(parseFloat(maxPrice)); idx++; }
  if (minQuantity !== undefined) { conditions.push(`p.quantity >= $${idx}`); values.push(parseInt(minQuantity)); idx++; }
  if (maxQuantity !== undefined) { conditions.push(`p.quantity <= $${idx}`); values.push(parseInt(maxQuantity)); idx++; }

  const where = conditions.join(' AND ');

  const [countRes, dataRes] = await Promise.all([
    query(`SELECT COUNT(*) FROM products p WHERE ${where}`, values),
    query(
      `SELECT ${PRODUCT_FIELDS}
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id AND c.is_active = TRUE
       WHERE ${where}
       ORDER BY p.${sortBy} ${safeOrder}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    ),
  ]);

  return paginatedData(dataRes.rows, countRes.rows[0].count, page, limit);
};

// ── Single ────────────────────────────────────────────────────────────────────

const fetchGallery = (productId) =>
  query(
    `SELECT id, product_id, image_url, display_order, created_at
     FROM product_images
     WHERE product_id = $1
     ORDER BY display_order ASC, created_at ASC`,
    [productId]
  );

const getById = async (id, userId) => {
  const [productRes, imagesRes] = await Promise.all([
    query(
      `SELECT ${PRODUCT_FIELDS}
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id AND c.is_active = TRUE
       WHERE p.id = $1 AND p.user_id = $2 AND p.is_active = TRUE`,
      [id, userId]
    ),
    fetchGallery(id),
  ]);

  if (productRes.rows.length === 0) throw new AppError('Product not found', 404);
  return { ...productRes.rows[0], images: imagesRes.rows };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const verifyOwnership = async (productId, userId) => {
  const res = await query(
    'SELECT id FROM products WHERE id = $1 AND user_id = $2 AND is_active = TRUE',
    [productId, userId]
  );
  if (res.rows.length === 0) throw new AppError('Product not found', 404);
};

// urls — array of fully-qualified Firebase Storage public URLs
const insertGallery = async (productId, urls, startOrder = 0) => {
  if (!urls || urls.length === 0) return;
  await Promise.all(
    urls.map((url, i) =>
      query(
        `INSERT INTO product_images (product_id, image_url, display_order)
         VALUES ($1, $2, $3)`,
        [productId, url, startOrder + i]
      )
    )
  );
};

// ── Create ────────────────────────────────────────────────────────────────────

const create = async (userId, { name, description, thumbnailImageUrl, price, quantity, categoryId, is_featured, galleryUrls }) => {
  if (galleryUrls && galleryUrls.length > MAX_GALLERY) {
    throw new AppError(`Maximum ${MAX_GALLERY} gallery images allowed per product`, 400);
  }

  const result = await query(
    `INSERT INTO products
       (user_id, category_id, name, description, thumbnail_image_url, price, quantity, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, user_id, category_id, name, description, image_url, thumbnail_image_url,
               price, quantity, is_active, is_featured, created_at, updated_at`,
    [userId, categoryId || null, name.trim(), description || null, thumbnailImageUrl || null, price, quantity ?? 0, is_featured ?? false]
  );

  const product = result.rows[0];
  await insertGallery(product.id, galleryUrls || []);

  return getById(product.id, userId);
};

// ── Update ────────────────────────────────────────────────────────────────────

const update = async (id, userId, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name.trim()); }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (data.thumbnailImageUrl !== undefined) { fields.push(`thumbnail_image_url = $${idx++}`); values.push(data.thumbnailImageUrl); }
  if (data.price !== undefined) { fields.push(`price = $${idx++}`); values.push(data.price); }
  if (data.quantity !== undefined) { fields.push(`quantity = $${idx++}`); values.push(data.quantity); }
  if (data.categoryId !== undefined) { fields.push(`category_id = $${idx++}`); values.push(data.categoryId || null); }
  if (data.is_featured !== undefined) { fields.push(`is_featured = $${idx++}`); values.push(data.is_featured); }

  if (fields.length === 0) throw new AppError('No fields to update', 400);

  values.push(id, userId);

  const result = await query(
    `UPDATE products
     SET ${fields.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx} AND is_active = TRUE
     RETURNING id, user_id, category_id, name, description, image_url, thumbnail_image_url,
               price, quantity, is_active, is_featured, created_at, updated_at`,
    values
  );

  if (result.rows.length === 0) throw new AppError('Product not found', 404);
  return result.rows[0];
};

// ── Soft-delete ───────────────────────────────────────────────────────────────

const remove = async (id, userId) => {
  const result = await query(
    `UPDATE products SET is_active = FALSE
     WHERE id = $1 AND user_id = $2 AND is_active = TRUE
     RETURNING id`,
    [id, userId]
  );
  if (result.rows.length === 0) throw new AppError('Product not found', 404);
};

// ── Gallery CRUD ──────────────────────────────────────────────────────────────

const getImages = async (productId, userId) => {
  await verifyOwnership(productId, userId);
  const res = await fetchGallery(productId);
  return res.rows;
};

const addImages = async (productId, userId, urls) => {
  await verifyOwnership(productId, userId);

  const countRes = await query(
    'SELECT COUNT(*) FROM product_images WHERE product_id = $1',
    [productId]
  );
  const current = parseInt(countRes.rows[0].count);
  if (current + urls.length > MAX_GALLERY) {
    throw new AppError(
      `Cannot add ${urls.length} image(s). Maximum ${MAX_GALLERY} gallery images allowed (currently ${current}).`,
      400
    );
  }

  const orderRes = await query(
    'SELECT COALESCE(MAX(display_order), -1) AS max_order FROM product_images WHERE product_id = $1',
    [productId]
  );
  const nextOrder = parseInt(orderRes.rows[0].max_order) + 1;

  const results = await Promise.all(
    urls.map((url, i) =>
      query(
        `INSERT INTO product_images (product_id, image_url, display_order)
         VALUES ($1, $2, $3)
         RETURNING id, product_id, image_url, display_order, created_at`,
        [productId, url, nextOrder + i]
      )
    )
  );
  return results.map((r) => r.rows[0]);
};

// Returns the deleted image_url so the controller can clean up Firebase Storage.
const deleteImage = async (imageId, productId, userId) => {
  await verifyOwnership(productId, userId);
  const result = await query(
    'DELETE FROM product_images WHERE id = $1 AND product_id = $2 RETURNING image_url',
    [imageId, productId]
  );
  if (result.rows.length === 0) throw new AppError('Image not found', 404);
  return result.rows[0].image_url;
};

const reorderImages = async (productId, userId, orders) => {
  await verifyOwnership(productId, userId);

  await Promise.all(
    orders.map(({ id, display_order }) =>
      query(
        'UPDATE product_images SET display_order = $1 WHERE id = $2 AND product_id = $3',
        [display_order, id, productId]
      )
    )
  );

  const res = await fetchGallery(productId);
  return res.rows;
};

module.exports = {
  getAll, getById, create, update, remove,
  getImages, addImages, deleteImage, reorderImages,
};
