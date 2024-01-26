const express = require('express');
const FollowerController = require('../controllers/FollowerController');
const isLoginMiddleware = require('../middlewares/isLoginMiddleware')

const router = express.Router();

router.get('/followers', isLoginMiddleware, FollowerController.getMyFollowers);

module.exports = router;
