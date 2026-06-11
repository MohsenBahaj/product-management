const { Router } = require('express');
const authController = require('./auth.controller');
const { registerValidation, loginValidation } = require('./auth.validation');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rate-limit.middleware');

const router = Router();

router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
