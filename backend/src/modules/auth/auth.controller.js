const authService = require('./auth.service');
const { success, created } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const data = await authService.register(name, email, password);
    return created(res, data);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const logout = (_req, res) => {
  // JWT is stateless — client discards the token.
  return success(res, { message: 'Logged out successfully' });
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, me };
