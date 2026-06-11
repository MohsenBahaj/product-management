const { Router } = require('express');
const searchHistoryController = require('./search-history.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = Router();

router.get('/', authenticate, searchHistoryController.getAll);
router.delete('/', authenticate, searchHistoryController.clearAll);

module.exports = router;
