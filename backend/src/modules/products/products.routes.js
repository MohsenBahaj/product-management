const { Router } = require('express');
const productsController = require('./products.controller');
const {
  createProductValidation,
  updateProductValidation,
  reorderValidation,
} = require('./products.validation');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { productFieldsUpload, productGalleryUpload } = require('../../middleware/upload.middleware');

const router = Router();

router.get('/', authenticate, productsController.getAll);
router.get('/:id', authenticate, productsController.getById);
router.post('/', authenticate, productFieldsUpload, createProductValidation, validate, productsController.create);
router.patch('/:id', authenticate, productFieldsUpload, updateProductValidation, validate, productsController.update);
router.delete('/:id', authenticate, productsController.remove);

// Gallery endpoints
router.get('/:id/images', authenticate, productsController.getImages);
router.post('/:id/images', authenticate, productGalleryUpload, productsController.addImages);
router.delete('/:id/images/:imageId', authenticate, productsController.deleteImage);
router.patch('/:id/images/reorder', authenticate, reorderValidation, validate, productsController.reorderImages);

module.exports = router;
