const express = require('express');
const SongController = require('../controllers/SongController');
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/Public/Uploads/Images');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

var upload = multer({ storage: storage });

const router = express.Router();

router.post('/create', upload.single('song'), SongController.createSong);

module.exports = router;
