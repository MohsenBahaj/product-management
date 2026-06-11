const usersService = require('./users.service');
const storageService = require('../../services/storage');
const AppError = require('../../utils/AppError');
const { success } = require('../../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const user = await usersService.getProfile(req.user.id);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await usersService.updateProfile(req.user.id, req.body);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No image file provided', 400);
    const imageUrl = await storageService.uploadFile(req.file, 'profiles');
    const user = await usersService.updateProfileImage(req.user.id, imageUrl);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadProfileImage };
