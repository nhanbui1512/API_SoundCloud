const express = require('express');
const multer = require('multer');
const UserController = require('../controllers/userController');

const isLoginMiddleware = require('../middlewares/isLoginMiddleware');
const encodedToken = require('../middlewares/encodedToken');
const userController = require('../controllers/userController');

const router = express.Router();

// cấu hình lưu trữ file và kiểm tra loại file gửi lên
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/Public/Uploads/Images');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

var upload = multer({ storage: storage });

router.post('/register', UserController.registerUser);
router.put('/update', upload.single('avatar'), isLoginMiddleware, UserController.updateUser);
router.put('/change-password', isLoginMiddleware, UserController.changePassWord);
router.get('/get-profile', isLoginMiddleware, UserController.getMyProfile);
router.get('/search', encodedToken, UserController.searchUser);
router.get('/user-top-song', encodedToken, UserController.getTopSong);

router.get('/get-users', encodedToken, userController.getListUse);
router.get('/', encodedToken, UserController.findUser);

module.exports = router;
