const express = require('express');
const route = express.Router();
const ListenController = require('../controllers/ListenController');

route.post('/', ListenController.incraseListenCount);
module.exports = route;
