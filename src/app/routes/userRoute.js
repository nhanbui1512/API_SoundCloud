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

/**
 * @swagger
 * tags:
 *   name: User
 *   description: The books managing API
 */

/**
 * @swagger

 * /api/user/register:
 *   post:
 *     summary: Register
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - userName
 *               - email
 *               - password
 *     responses:
 *       '200':
 *          description: Successful
 */

router.post('/register', UserController.registerUser);

/**
 * @swagger
 * /api/user/update:
 *   put:
 *     summary: Update User
 *     security:
 *      - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 default: ""
 *               city:
 *                 type: string
 *                 default: ""
 *               country:
 *                 type: string
 *                 default: ""
 *               bio:
 *                type: string
 *                default: ""
 *
 *     responses:
 *       '200':
 *          description: Successful
 */

router.put('/update', upload.single('avatar'), isLoginMiddleware, UserController.updateUser);

/**
 * @swagger
 * /api/user/change-password:
 *   put:
 *     summary: Change Password
 *     security:
 *      - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               ownPassWord:
 *                 type: string
 *               newPassWord:
 *                 type: string
 *               confirmPassWord:
 *                 type: string
 *             required:
 *              - ownPassWord
 *              - newPassWord
 *              - confirmPassWord
 *     responses:
 *       '200':
 *          description: Successful
 */
router.put('/change-password', isLoginMiddleware, UserController.changePassWord);

/**
 * @swagger
 * /api/user/get-profile:
 *   get:
 *     summary: Get My Profile
 *     security:
 *      - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *       '401':
 *          description: Authorize Error
 */
router.get('/get-profile', isLoginMiddleware, UserController.getMyProfile);

/**
 * @swagger
 * /api/user/search:
 *   get:
 *     summary: Search User
 *     parameters:
 *      - in: query
 *        name: value
 *        schema:
 *          type: string
 *        required: true
 *        description: email or user name
 *     tags: [User]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *       '401':
 *          description: Authorize Error
 */
router.get('/search', encodedToken, UserController.searchUser);
/**
 * @swagger
 * /api/user/user-top-song:
 *   get:
 *     summary: Get users who have the highest song number
 *     tags: [User]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *
 */
router.get('/user-top-song', encodedToken, UserController.getTopSong);
/**
 * @swagger
 * /api/user/get-users:
 *   get:
 *     summary: Get Users
 *     parameters:
 *      - in: query
 *        name: quantity
 *        schema:
 *          type: integer
 *        required: true
 *        description: Numeric ID of the user to get
 *     tags: [User]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *
 */
router.get('/get-users', encodedToken, userController.getListUser);

/**
 * @swagger
 * tags:
 *   name: User
 * /api/user/:
 *   get:
 *     summary: Find User
 *     tags: [User]
 *     parameters:
 *      - in: query
 *        name: user_id
 *        schema:
 *          type: integer
 *        required: true
 *        description: Numeric ID of the user to get
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */
router.get('/', encodedToken, UserController.findUser);

module.exports = router;
