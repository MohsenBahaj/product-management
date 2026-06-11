const categoriesService = require('./categories.service');
const storageService = require('../../services/storage');
const AppError = require('../../utils/AppError');
const { success, created, noContent } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try {
    const categories = await categoriesService.getAll(req.user.id);
    return success(res, { categories });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const category = await categoriesService.getById(req.params.id, req.user.id);
    return success(res, { category });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const imageUrl = req.file
      ? await storageService.uploadFile(req.file, 'categories')
      : null;
    const category = await categoriesService.create(req.user.id, { ...req.body, imageUrl });
    return created(res, { category });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const imageUrl = req.file
      ? await storageService.uploadFile(req.file, 'categories')
      : undefined;
    const category = await categoriesService.update(req.params.id, req.user.id, {
      ...req.body,
      imageUrl,
    });
    return success(res, { category });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await categoriesService.remove(req.params.id, req.user.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
