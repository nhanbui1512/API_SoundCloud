const pagination = ({ page = 1, perPage, count }) => {
  if (!perPage) perPage = count;
  const offset = (page - 1) * perPage;

  const totalDocs = count;
  const totalPages = Math.ceil(totalDocs / perPage);
  const currentPage = page;
  const pagingCounter = offset + 1;
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const prevPage = hasPrevPage ? page - 1 : null;
  const nextPage = hasNextPage ? page + 1 : null;

  return {
    totalDocs,
    perPage,
    currentPage,
    totalPages,
    pagingCounter,
    hasPrevPage,
    hasNextPage,
    prevPage,
    nextPage,
  };
};
module.exports = pagination;
