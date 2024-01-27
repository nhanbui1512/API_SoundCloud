const express = require('express');
const FollowController = require('../controllers/FollowController');
const isLoginMiddleware = require('../middlewares/isLoginMiddleware');

const router = express.Router();

router.get('/followers', isLoginMiddleware, FollowController.getMyFollowers);
router.get('/playlists', isLoginMiddleware, FollowController.MyPlaylists);

router.post('/playlists', isLoginMiddleware, FollowController.followingPlaylist);

router.delete('/playlists', isLoginMiddleware, FollowController.Unfollowingplaylist);

router.delete('/', isLoginMiddleware, FollowController.unFollowUser);
router.post('/', isLoginMiddleware, FollowController.followUser);
module.exports = router;
