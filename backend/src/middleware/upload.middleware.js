const multer = require('multer');
const config = require('../config');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

// Files go to memory so they can be streamed directly to Firebase Storage.
// req.file.buffer / req.files[*].buffer holds the raw bytes.
const memoryStorage = multer.memoryStorage();
const maxSize = (config.uploadMaxSizeMb || 5) * 1024 * 1024;

const uploader = multer({ storage: memoryStorage, fileFilter, limits: { fileSize: maxSize } });

// Generic error-forwarding wrappers
const wrapSingle = (field) => (req, res, next) =>
  uploader.single(field)(req, res, (err) => (err ? next(err) : next()));

const wrapFields = (fields) => (req, res, next) =>
  uploader.fields(fields)(req, res, (err) => (err ? next(err) : next()));

const wrapArray = (field, maxCount) => (req, res, next) =>
  uploader.array(field, maxCount)(req, res, (err) => (err ? next(err) : next()));

// ── Products ─────────────────────────────────────────────────────────────────

// Create / Update product: thumbnail_image (1) + gallery images (≤10)
const productFieldsUpload = wrapFields([
  { name: 'thumbnail_image', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

// Add gallery images only
const productGalleryUpload = wrapArray('images', 10);

// ── Profiles ─────────────────────────────────────────────────────────────────
const profileUpload = wrapSingle('image');

// ── Categories ───────────────────────────────────────────────────────────────
const categoryUpload = wrapSingle('image');

module.exports = {
  productFieldsUpload,
  productGalleryUpload,
  profileUpload,
  categoryUpload,
};
