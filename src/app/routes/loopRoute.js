const express = require('express');
const route = express.Router();

const LoopController = require('../controllers/LoopController');

route.post('/', LoopController.increaseLoopCount);
module.exports = route;
