const rateLimit = require('express-rate-limit');
const config = require('../config');

const skipDocs = (req) => req.path.startsWith('/api-docs');

const authLimiter = rateLimit({
  windowMs: config.authRateLimitWindow * 60 * 1000,
  max: config.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDocs,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

const apiLimiter = rateLimit({
  windowMs: config.apiRateLimitWindow * 60 * 1000,
  max: config.apiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDocs,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

module.exports = { authLimiter, apiLimiter };
