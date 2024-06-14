const express = require('express');
const route = express.Router();
const NotiTypeController = require('../controllers/NotiTypeController');
const { notiTypeValidation } = require('../Validations/notiTypeValidation');

/**
 * @swagger
 * tags:
 *   name: NotiTypes
 *   description: NotiTypes APIs
 */

/**
 * @swagger
 * /api/noti-type:
 *   post:
 *     summary: Create a type of notification
 *     tags: [NotiTypes]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       '200':
 *          description: Successful
 *
 */
route.post('/', notiTypeValidation, NotiTypeController.createNotiType);
module.exports = route;
