const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.upload_cloud_name || '',
  api_key: process.env.upload_api_key || '',
  api_secret: process.env.upload_api_secret || '',
});

module.exports = cloudinary;
