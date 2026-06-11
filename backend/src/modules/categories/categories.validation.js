const { body } = require('express-validator');

const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
];

const updateCategoryValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim(),
];

module.exports = { createCategoryValidation, updateCategoryValidation };
