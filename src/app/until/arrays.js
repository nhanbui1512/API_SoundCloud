function shuffleArray(array) {
  // Sử dụng hàm sort với hàm ngẫu nhiên Math.random()
  return array.sort(() => Math.random() - 0.5);
}

function removeDuplicates(arr) {
  return [...new Set(arr)];
}

function paginateArray(array, page, limit) {
  // Tính toán vị trí bắt đầu (offset) và kết thúc
  const offset = (page - 1) * limit;
  const paginatedItems = array.slice(offset, offset + limit);

  // Trả về mảng đã phân trang
  return paginatedItems;
}

module.exports = { shuffleArray, removeDuplicates, paginateArray };
