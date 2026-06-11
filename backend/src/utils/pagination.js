const getPagination = (queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginatedData = (rows, total, page, limit) => ({
  data: rows,
  pagination: {
    page,
    limit,
    total: parseInt(total),
    pages: Math.ceil(parseInt(total) / limit),
  },
});

module.exports = { getPagination, paginatedData };
