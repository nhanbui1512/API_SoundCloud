const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const secretKey = process.env.secretKey; // Thay thế bằng khoá bí mật thực tế
// Hàm mã hóa chuỗi

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-cbc', secretKey);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Hàm giải mã chuỗi
function decrypt(encryptedText) {
  const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt,
};
