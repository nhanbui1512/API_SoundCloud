const express = require('express');
const FollowController = require('../controllers/FollowController');
const isLoginMiddleware = require('../middlewares/isLoginMiddleware');

const router = express.Router();

router.get('/followers', isLoginMiddleware, FollowController.getMyFollowers);
router.post('/playlists', isLoginMiddleware, FollowController.followingPlaylist);
router.delete('/playlists', isLoginMiddleware, FollowController.Unfollowingplaylist);

module.exports = router;
