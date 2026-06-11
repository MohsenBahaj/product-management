const errorHandler = (err, req, res, next) => {
  // Operational errors thrown by AppError
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Multer: file too large
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds the allowed limit',
    });
  }

  // Multer: wrong file type (thrown by fileFilter)
  if (err.message && err.message.startsWith('Only')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // PostgreSQL: unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    });
  }

  // PostgreSQL: invalid UUID format
  if (err.code === '22P02') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  // PostgreSQL: foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist',
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({ success: false, message: 'Internal server error' });
};

module.exports = { errorHandler };
