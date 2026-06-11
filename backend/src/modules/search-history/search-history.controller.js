const searchHistoryService = require('./search-history.service');
const { success, noContent } = require('../../utils/response');

const getAll = async (req, res, next) => {
  try {
    const history = await searchHistoryService.getAll(req.user.id, req.query.limit);
    return success(res, { history });
  } catch (err) {
    next(err);
  }
};

const clearAll = async (req, res, next) => {
  try {
    await searchHistoryService.clearAll(req.user.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, clearAll };
