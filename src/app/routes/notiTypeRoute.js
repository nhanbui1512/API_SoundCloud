const express = require('express');
const route = express.Router();
const NotiTypeController = require('../controllers/NotiTypeController');
const {
  notiTypeValidation,
  deleteNotiTypeValidation,
} = require('../Validations/notiTypeValidation');

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

/**
 * @swagger
 * /api/noti-type/{id}:
 *   delete:
 *     summary: Delete a type of notification
 *     tags: [NotiTypes]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: notitype id
 *     responses:
 *       '200':
 *          description: Successful
 */
route.delete('/:id', deleteNotiTypeValidation, NotiTypeController.deleteNotitype);
module.exports = route;
