const fs = require('fs');
const path = require('path');
const logFilePath = path.join('logs/db_connection.log');

const logToFile = (message) => {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Không thể ghi log:', err);
    }
  });
};

module.exports = { logToFile };
