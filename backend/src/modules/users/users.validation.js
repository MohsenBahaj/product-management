const { body } = require('express-validator');

const updateProfileValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
];

module.exports = { updateProfileValidation };
