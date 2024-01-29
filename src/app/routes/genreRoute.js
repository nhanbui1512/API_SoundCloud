const express = require('express');
const GenreControler = require('../controllers/GenreController');
const enCodedToken = require('../middlewares/encodedToken');

const router = express.Router();

router.post('/create', GenreControler.create);
router.get('/getall', GenreControler.getAll);
router.get('/get-songs', enCodedToken, GenreControler.getSongsById);

module.exports = router;
