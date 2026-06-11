const { Router } = require('express');
const categoriesController = require('./categories.controller');
const { createCategoryValidation, updateCategoryValidation } = require('./categories.validation');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { categoryUpload } = require('../../middleware/upload.middleware');

const router = Router();

router.get('/', authenticate, categoriesController.getAll);
router.get('/:id', authenticate, categoriesController.getById);
router.post('/', authenticate, categoryUpload, createCategoryValidation, validate, categoriesController.create);
router.patch('/:id', authenticate, categoryUpload, updateCategoryValidation, validate, categoriesController.update);
router.delete('/:id', authenticate, categoriesController.remove);

module.exports = router;
