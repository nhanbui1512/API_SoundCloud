const express = require('express');
const PlaylistController = require('../controllers/PlaylistController');
const authMiddleware = require('../middlewares/authMiddleware');
const encodedToken = require('../middlewares/encodedToken');
const {
  updateValidation,
  getPlaylist,
  getPlaylistByUserId,
} = require('../Validations/playlistValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Playlist
 *   description: The playlist managing API
 */

/**
 * @swagger

 * /api/playlist:
 *   get:
 *     summary: Get playlist by id
 *     tags: [Playlist]
 *     parameters:
 *      - in: query
 *        name: idPlaylist
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: id of playlist
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
router.get('/', encodedToken, PlaylistController.getPlaylistById);

/**
 * @swagger

 * /api/playlist/getall:
 *   get:
 *     summary: Get playlists
 *     tags: [Playlist]
 *     parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: page of playlist
 *      - in: query
 *        name: per_page
 *        schema:
 *          type: integer
 *          default: 15
 *        required: true
 *        description: number playlist
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
router.get('/getall', getPlaylist, encodedToken, PlaylistController.getAllPlaylist);

/**
 * @swagger

 * /api/playlist/get-playlist-user:
 *   get:
 *     summary: Get playlists of user
 *     tags: [Playlist]
 *     parameters:
 *      - in: query
 *        name: idUser
 *        schema:
 *          type: integer
 *        required: true
 *        description: id of user
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
router.get(
  '/get-playlist-user',
  getPlaylistByUserId,
  encodedToken,
  PlaylistController.getPlaylistByUserId,
);

/**
 * @swagger

 * /api/playlist/follow-playlists:
 *   get:
 *     summary: Get playlists following
 *     tags: [Playlist]
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
 *
 */
router.get('/follow-playlists', authMiddleware, PlaylistController.MyPlaylists); //playlist following

/**
 * @swagger

 * /api/playlist/playlist-followed:
 *   get:
 *     summary: get users who are following a playlist by playlist id
 *     tags: [Playlist]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: idPlaylist
 *        schema:
 *          type: string
 *        required: true
 *        description: id of playlist
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
router.get('/playlist-followed', authMiddleware, PlaylistController.getUserFollowPlaylist); //playlist followed users

/**
 * @swagger

 * /api/playlist/random:
 *   get:
 *     summary: get random playlists
 *     tags: [Playlist]
 *     parameters:
 *      - in: query
 *        name: quantity
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: number playlist
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
router.get('/random', encodedToken, PlaylistController.getRandomPlaylist);

/**
 * @swagger

 * /api/playlist/create:
 *   post:
 *     summary: Create a playlist
 *     tags: [Playlist]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                type: string
 *                description: "Name of Playlist"
 *               idSongs:
 *                 type: array
 *                 description: "Songs of Playlist"
 *             required:
 *               - idSongs
 *               - name
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */
router.post('/create', authMiddleware, PlaylistController.createPlaylist);

/**
 * @swagger

 * /api/playlist/add-songs:
 *   post:
 *     summary: Add songs into playlist or change name of playlist
 *     tags: [Playlist]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: idPlaylist
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: number playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                type: string
 *                description: "Name of Playlist"
 *               idSongs:
 *                 type: array
 *                 description: "Songs of Playlist"
 *             required:
 *               - idSongs
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */
router.post('/add-songs', authMiddleware, PlaylistController.addSongsToPlaylist);

/**
 * @swagger

 * /api/playlist/update:
 *   put:
 *     summary: Update playlist
 *     tags: [Playlist]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: idPlaylist
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: number playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                type: string
 *                description: "Name of Playlist"
 *               idSongs:
 *                 type: array
 *                 description: "Songs of Playlist"
 *             required:
 *               - idSongs
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */
router.put('/update', updateValidation, authMiddleware, PlaylistController.updatePlaylist);

/**
 * @swagger

 * /api/playlist/remove-songs:
 *   delete:
 *     summary: Remove songs in playlist
 *     tags: [Playlist]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: idPlaylist
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: number playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               idSongs:
 *                 type: array
 *                 description: "Songs of Playlist"
 *             required:
 *               - idSongs
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */
router.delete('/remove-songs', authMiddleware, PlaylistController.removeSongsToPlaylist);

/**
 * @swagger
 *
 * /api/playlist:
 *   delete:
 *     summary: Delete a playlist
 *     tags: [Playlist]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: idPlaylist
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: number playlist
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */
router.delete('/', authMiddleware, PlaylistController.deletePlaylistById);

module.exports = router;
