const express = require('express');
const route = express.Router();

const LoopController = require('../controllers/LoopController');

/**
 * @swagger
 * tags:
 *   name: Actions
 *   description: Count action number of songs
 * /api/loop:
 *   post:
 *     summary: Increase loop number of songs
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
route.post('/', LoopController.increaseLoopCount);
module.exports = route;
