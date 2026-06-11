const { body, query } = require('express-validator');

const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('description').optional().trim(),
  body('categoryId').optional({ nullable: true }).isUUID().withMessage('categoryId must be a valid UUID'),
  body('is_featured').optional().isBoolean({ strict: false }).withMessage('is_featured must be a boolean'),
];

const updateProductValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('description').optional().trim(),
  body('categoryId')
    .optional({ nullable: true })
    .custom((v) => v === null || v === '' || /^[0-9a-f-]{36}$/i.test(v))
    .withMessage('categoryId must be a valid UUID or null'),
  body('is_featured').optional().isBoolean({ strict: false }).withMessage('is_featured must be a boolean'),
];

const reorderValidation = [
  body('orders').isArray({ min: 1 }).withMessage('orders must be a non-empty array'),
  body('orders.*.id').isUUID().withMessage('Each order must have a valid image ID'),
  body('orders.*.display_order')
    .isInt({ min: 0 })
    .withMessage('display_order must be a non-negative integer'),
];

module.exports = { createProductValidation, updateProductValidation, reorderValidation };
