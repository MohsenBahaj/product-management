const productsService = require('./products.service');
const searchHistoryService = require('../search-history/search-history.service');
const storageService = require('../../services/storage');
const AppError = require('../../utils/AppError');
const { success, created, noContent } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await productsService.getAll(req.user.id, req.query);

    const term = (req.query.search || '').trim();
    if (term) {
      searchHistoryService.save(req.user.id, term).catch(() => {});
    }

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productsService.getById(req.params.id, req.user.id);
    return success(res, { product });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const thumbnailFile = req.files?.['thumbnail_image']?.[0];
    if (!thumbnailFile) throw new AppError('thumbnail_image is required', 400);

    const thumbnailImageUrl = await storageService.uploadFile(thumbnailFile, 'products/thumbnails');

    const galleryUrls = await Promise.all(
      (req.files?.['images'] || []).map((f) => storageService.uploadFile(f, 'products/gallery'))
    );

    const isFeatured = req.body.is_featured;
    const product = await productsService.create(req.user.id, {
      name: req.body.name,
      description: req.body.description,
      thumbnailImageUrl,
      price: parseFloat(req.body.price),
      quantity: req.body.quantity !== undefined ? parseInt(req.body.quantity) : 0,
      categoryId: req.body.categoryId || null,
      is_featured: isFeatured === true || isFeatured === 'true',
      galleryUrls,
    });
    return created(res, { product });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const thumbnailFile = req.files?.['thumbnail_image']?.[0];
    const thumbnailImageUrl = thumbnailFile
      ? await storageService.uploadFile(thumbnailFile, 'products/thumbnails')
      : undefined;

    const data = {};
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (thumbnailImageUrl !== undefined) data.thumbnailImageUrl = thumbnailImageUrl;
    if (req.body.price !== undefined) data.price = parseFloat(req.body.price);
    if (req.body.quantity !== undefined) data.quantity = parseInt(req.body.quantity);
    if (req.body.categoryId !== undefined) data.categoryId = req.body.categoryId || null;
    if (req.body.is_featured !== undefined) {
      const v = req.body.is_featured;
      data.is_featured = v === true || v === 'true';
    }

    const product = await productsService.update(req.params.id, req.user.id, data);
    return success(res, { product });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await productsService.remove(req.params.id, req.user.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
};

const getImages = async (req, res, next) => {
  try {
    const images = await productsService.getImages(req.params.id, req.user.id);
    return success(res, images);
  } catch (err) {
    next(err);
  }
};

const addImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('At least one image file is required', 400);
    }
    const urls = await Promise.all(
      req.files.map((f) => storageService.uploadFile(f, 'products/gallery'))
    );
    const images = await productsService.addImages(req.params.id, req.user.id, urls);
    return created(res, images);
  } catch (err) {
    next(err);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const imageUrl = await productsService.deleteImage(
      req.params.imageId,
      req.params.id,
      req.user.id
    );
    // Best-effort Firebase cleanup — DB record is already gone (source of truth)
    storageService.deleteFile(imageUrl).catch(() => {});
    return noContent(res);
  } catch (err) {
    next(err);
  }
};

const reorderImages = async (req, res, next) => {
  try {
    const images = await productsService.reorderImages(
      req.params.id,
      req.user.id,
      req.body.orders
    );
    return success(res, images);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll, getById, create, update, remove,
  getImages, addImages, deleteImage, reorderImages,
};
