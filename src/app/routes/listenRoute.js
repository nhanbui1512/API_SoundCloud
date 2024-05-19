const express = require('express');
const route = express.Router();
const ListenController = require('../controllers/ListenController');

/**
 * @swagger
 * /api/listen:
 *   post:
 *     summary: Increase listen number of songs
 *     tags: [Actions]
 *     parameters:
 *      - in: query
 *        name: song_id
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: song id
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *
 */
route.post('/', ListenController.increaseListenCount);
module.exports = route;
