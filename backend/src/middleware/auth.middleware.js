const jwt = require('jsonwebtoken');
const config = require('../config');
const { fail } = require('../utils/response');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, 'Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return fail(res, 'Token expired', 401);
    }
    return fail(res, 'Invalid token', 401);
  }
};

module.exports = { authenticate };
