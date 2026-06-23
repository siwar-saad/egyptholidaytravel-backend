/* ================= PAGINATION HELPERS ================= */
const getPagination = (req, options = {}) => {
  const defaultLimit = options.defaultLimit || 50;
  const maxLimit = options.maxLimit || 100;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(req.query.limit) || defaultLimit, 1),
    maxLimit
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const setPaginationHeaders = (res, total, page, limit) => {
  res.set("X-Total-Count", String(total));
  res.set("X-Page", String(page));
  res.set("X-Limit", String(limit));
  res.set("X-Total-Pages", String(Math.ceil(total / limit)));
};

module.exports = {
  getPagination,
  setPaginationHeaders,
};
