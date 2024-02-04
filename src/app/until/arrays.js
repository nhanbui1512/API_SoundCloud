function shuffleArray(array) {
  // Sử dụng hàm sort với hàm ngẫu nhiên Math.random()
  return array.sort(() => Math.random() - 0.5);
}

function removeDuplicates(arr) {
  return [...new Set(arr)];
}

module.exports = { shuffleArray, removeDuplicates };
