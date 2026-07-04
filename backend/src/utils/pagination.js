function getPagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 25), 1), 100);
  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

function pagedResponse(rows, total, page, limit) {
  return {
    data: rows,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

module.exports = {
  getPagination,
  pagedResponse
};
