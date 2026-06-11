const success = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const created = (res, data) => success(res, data, 201);

const noContent = (res) => res.status(204).send();

const fail = (res, message, statusCode = 400) =>
  res.status(statusCode).json({ success: false, message });

module.exports = { success, created, noContent, fail };
