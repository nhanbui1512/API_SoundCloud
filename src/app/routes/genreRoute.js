const express = require('express');
const GenreControler = require('../controllers/GenreController');

const router = express.Router();

router.post('/create', GenreControler.create);

module.exports = router;
