const moment = require('moment');
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

// tính thời gian từ thời điểm bất kỳ đến hiện tại
const calculateTimeFromNow = (time) => {
  const createAtTime = moment(time);
  return createAtTime.fromNow();
};

module.exports = { formatTime, calculateTimeFromNow };

// const currentTime = moment();
// const diffInSeconds = currentTime.diff(createAtTime, 'seconds');

// const timeUnits = [
//   { unit: 'năm', value: diffInSeconds / (365 * 24 * 3600) },
//   { unit: 'tháng', value: diffInSeconds / (30 * 24 * 3600) },
//   { unit: 'tuần', value: diffInSeconds / (7 * 24 * 3600) },
//   { unit: 'ngày', value: diffInSeconds / (24 * 3600) },
//   { unit: 'giờ', value: diffInSeconds / 3600 },
//   { unit: 'phút', value: diffInSeconds / 60 },
//   { unit: 'giây', value: diffInSeconds },
// ];
// for (const { unit, value } of timeUnits) {
//   if (Math.floor(value) >= 1) {
//     return `${Math.floor(value)} ${unit}${Math.floor(value) > 1 ? '' : ''} trước`;
//   }
// }
// return 'just now';
