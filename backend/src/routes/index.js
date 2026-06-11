const { Router } = require('express');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/users', require('../modules/users/users.routes'));
router.use('/products', require('../modules/products/products.routes'));
router.use('/categories', require('../modules/categories/categories.routes'));
router.use('/search-history', require('../modules/search-history/search-history.routes'));

module.exports = router;
