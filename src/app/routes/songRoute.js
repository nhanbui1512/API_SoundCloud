const express = require('express');
const SongController = require('../controllers/SongController');
const multer = require('multer');
const isLoginMiddleWare = require('../middlewares/isLoginMiddleware');
const enCodedToken = require('../middlewares/encodedToken');

// cấu hình lưu trữ file và kiểm tra loại file gửi lên
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Chọn thư mục lưu trữ
    if (file.fieldname === 'thumbNail' && file.mimetype.includes('image')) {
      cb(null, './src/Public/Uploads/Images');
    } else if (file.fieldname === 'song' && file.mimetype === 'audio/mpeg') {
      cb(null, './src/Public/Uploads/Audios');
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

var upload = multer({ storage: storage });

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Song
 *   description: The songs managing API
 */

router.post(
  '/create',
  isLoginMiddleWare,
  upload.fields([
    { name: 'song', maxCount: 1 },
    { name: 'thumbNail', maxCount: 1 },
  ]),
  SongController.createSong,
);

/**
 * @swagger

 * /api/song/get-songs:
 *   get:
 *     summary: Get songs
 *     tags: [Song]
 *     parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: page of songs
 *      - in: query
 *        name: per_page
 *        schema:
 *          type: integer
 *          default: 15
 *        required: true
 *        description: number per page
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

router.get('/get-songs', enCodedToken, SongController.getSongs);

/**
 * @swagger

 * /api/song/getsong:
 *   get:
 *     summary: Get song by id
 *     tags: [Song]
 *     parameters:
 *      - in: query
 *        name: song_id
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: song id
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

router.get('/getsong', enCodedToken, SongController.getSongById);

/**
 * @swagger

 * /api/song/search:
 *   get:
 *     summary: Search song and playlist by name
 *     tags: [Song]
 *     parameters:
 *      - in: query
 *        name: value
 *        schema:
 *          type: string
 *          default: ""
 *        required: true
 *        description: value
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 */
router.get('/search', SongController.SearchSong);

/**
 * @swagger

 * /api/song/recommend:
 *   get:
 *     summary: Get recommend songs
 *     tags: [Song]
 *     
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 */
router.get('/recommend', enCodedToken, SongController.RecommendSongs);

/**
 * @swagger

 * /api/song/liked:
 *   get:
 *     summary: Get recommend songs
 *     tags: [Song]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 */

router.get('/liked', isLoginMiddleWare, SongController.getSongsLiked);

router.post('/like', isLoginMiddleWare, SongController.LikeSong);

router.delete('/unlike', isLoginMiddleWare, SongController.UnlikeSong);
router.delete('/', isLoginMiddleWare, SongController.deleteSong);
module.exports = router;
