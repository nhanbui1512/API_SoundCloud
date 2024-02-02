const express = require('express');
const PlaylistController = require('../controllers/PlaylistController');
const isLoginMiddleware = require('../middlewares/isLoginMiddleware');
const encodedToken = require('../middlewares/encodedToken');

const router = express.Router();

router.get('/', encodedToken, PlaylistController.getPlaylistById);
router.get('/getall', encodedToken, PlaylistController.getAllPlaylist);
router.get('/get-playlist-user', encodedToken, PlaylistController.getPlaylistByUserId);
router.get('/follow-playlists', isLoginMiddleware, PlaylistController.MyPlaylists); //playlist following
router.get('/playlist-followed', isLoginMiddleware, PlaylistController.getUserFollowPlaylist); //playlist followed users

router.post('/create', isLoginMiddleware, PlaylistController.createPlaylist);
router.post('/add-songs', isLoginMiddleware, PlaylistController.addSongsToPlaylist);
router.put('/update', isLoginMiddleware, PlaylistController.updatePlaylist);

router.delete('/remove-songs', isLoginMiddleware, PlaylistController.removeSongsToPlaylist);
router.delete('/', isLoginMiddleware, PlaylistController.deletePlaylistById);

module.exports = router;
