const fs = require('fs');

async function DeleteFile(path) {
  try {
    fs.unlink(path, (err) => {
      if (err) {
        throw err;
      } else {
        return;
      }
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  DeleteFile,
};
