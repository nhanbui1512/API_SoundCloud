const express = require('express');
const SongController = require('../controllers/SongController');
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const enCodedToken = require('../middlewares/encodedToken');
const {
  createSongValidation,
  songsLikedValidation,
  getSongsValidation,
  likeSongValidation,
} = require('../Validations/songValidation');

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

/**
 * @swagger

 * /api/song/create:
 *   post:
 *     summary: Create song
 *     tags: [Song]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               song:
 *                 type: file
 *               thumbNail:
 *                 type: file
 *               description:
 *                 type: string
 *               genreId:
 *                 type: string
 *               name:
 *                 type: string
 *               artistName:
 *                 type: string
 *             required:
 *               - song
 *               - description
 *               - genreId
 *               - name
 *               - artistName
 *               - thumbNail
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 */

router.post(
  '/create',
  authMiddleware,
  upload.fields([
    { name: 'song', maxCount: 1 },
    { name: 'thumbNail', maxCount: 1 },
  ]),
  createSongValidation,
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
 *        required: false
 *        description: page of songs
 *      - in: query
 *        name: per_page
 *        schema:
 *          type: integer
 *          default: 10
 *        required: false
 *        description: number per page
 *      - in: query
 *        name: sort
 *        schema:
 *          type: string
 *          default: create_asc
 *        required: false
 *        description: 'type sorting : create_asc, create_desc, name_asc, name_desc, listen_asc, listen_desc, loop_asc, loop_desc'
 *      - in: query
 *        name: search
 *        schema:
 *          type: string
 *        required: false
 *        description: 'search song'
 *      - in: query
 *        name: suffle
 *        schema:
 *          type: boolean
 *          default: false
 *        required: false
 *        description: 'is suffle list music'
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

router.get('/get-songs', getSongsValidation, enCodedToken, SongController.getSongs);

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
 *     summary: Get liked songs
 *     tags: [Song]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: user_id
 *        schema:
 *          type: integer
 *          default: 1
 *        required: false
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

router.get('/liked', authMiddleware, songsLikedValidation, SongController.getSongsLiked);

/**
 * @swagger

 * /api/song/like:
 *   post:
 *     summary: Like song
 *     tags: [Song]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: song_id
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

router.post('/like', likeSongValidation, authMiddleware, SongController.LikeSong);

/**
 * @swagger

 * /api/song/unlike:
 *   delete:
 *     summary: Unlike song
 *     tags: [Song]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: song_id
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

router.delete('/unlike', authMiddleware, SongController.UnlikeSong);

/**
 * @swagger

 * /api/song/:
 *   delete:
 *     summary: Delete Song
 *     tags: [Song]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: song_id
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

router.delete('/', authMiddleware, SongController.deleteSong);
module.exports = router;
