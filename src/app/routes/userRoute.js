const express = require('express');
const UserController = require('../controllers/userController');
const isLoginMiddleware = require('../middlewares/isLoginMiddleware');
const router = express.Router();

const multer = require('multer');
const userController = require('../controllers/userController');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Chọn thư mục lưu trữ
    if (file.fieldname === 'avatar' && file.mimetype.includes('image')) {
      cb(null, './src/Public/Uploads/Images');
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

var upload = multer({ storage: storage });

router.post('/register', UserController.registerUser);
router.put('/update', isLoginMiddleware, UserController.updateUser);
router.put('/change-password', isLoginMiddleware, UserController.changePassWord);
router.get('/get-profile', isLoginMiddleware, userController.getMyProfile);

module.exports = router;
