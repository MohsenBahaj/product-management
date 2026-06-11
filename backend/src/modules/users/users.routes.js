const { Router } = require('express');
const usersController = require('./users.controller');
const { updateProfileValidation } = require('./users.validation');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { profileUpload } = require('../../middleware/upload.middleware');

const router = Router();

router.get('/profile', authenticate, usersController.getProfile);
router.patch('/profile', authenticate, updateProfileValidation, validate, usersController.updateProfile);
router.post('/profile-image', authenticate, profileUpload, usersController.uploadProfileImage);

module.exports = router;
