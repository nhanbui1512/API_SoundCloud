const express = require('express');
const FollowController = require('../controllers/FollowController');
const isLoginMiddleware = require('../middlewares/isLoginMiddleware');

const router = express.Router();

router.get('/followers', isLoginMiddleware, FollowController.getMyFollowers);
router.get('/playlists', isLoginMiddleware, FollowController.MyPlaylists);
router.post('/followplaylist', isLoginMiddleware, FollowController.followingPlaylist);

module.exports = router;
