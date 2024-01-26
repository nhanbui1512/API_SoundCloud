const express = require('express');
const GenreControler = require('../controllers/GenreController');

const router = express.Router();

router.post('/create', GenreControler.create);
router.get('/getall', GenreControler.getAll);

module.exports = router;
