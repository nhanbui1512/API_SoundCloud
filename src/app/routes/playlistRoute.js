const express = require('express');
const PlaylistController = require('../controllers/PlaylistController');
const isLoginMiddleware = require('../middlewares/isLoginMiddleware');

const router = express.Router();

router.get('/', isLoginMiddleware, PlaylistController.getPlaylistById);
router.get('/getall', isLoginMiddleware, PlaylistController.getAllPlaylist);
router.get('/follow-playlists', isLoginMiddleware, PlaylistController.MyPlaylists); //playlist following
router.get('/playlist-followed', isLoginMiddleware, PlaylistController.getUserFollowPlaylist); //playlist followed users

router.post('/create', isLoginMiddleware, PlaylistController.createPlaylist);
router.post('/add-songs', isLoginMiddleware, PlaylistController.addSongsToPlaylist);

router.delete('/', isLoginMiddleware, PlaylistController.deletePlaylistById);

module.exports = router;
