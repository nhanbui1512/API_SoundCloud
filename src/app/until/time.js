const formatTime = (timeStr) => {
  const date = new Date(timeStr);
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: date.getFullYear(),
    hour: date.getHours(),
    minute: String(date.getMinutes()).padStart(2, '0'),
    second: String(date.getSeconds()).padStart(2, '0'),
  };
};

module.exports = { formatTime };
