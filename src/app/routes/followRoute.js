const express = require('express');
const FollowController = require('../controllers/FollowController');
const isLoginMiddleware = require('../middlewares/isLoginMiddleware');

const router = express.Router();

router.get('/followers', isLoginMiddleware, FollowController.getMyFollowers);
router.delete('/', isLoginMiddleware, FollowController.unFollowUser);
router.post('/', isLoginMiddleware, FollowController.followUser);

module.exports = router;
