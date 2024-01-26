const express = require('express');
const PlaylistController = require('../controllers/PlaylistController');
const isLoginMiddleware = require('../middlewares/isLoginMiddleware')

const router = express.Router();

router.get('/getall', isLoginMiddleware, PlaylistController.getAllPlaylist);
router.post('/create', isLoginMiddleware, PlaylistController.createPlaylist);

module.exports = router;
