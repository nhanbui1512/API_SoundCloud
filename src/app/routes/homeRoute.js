const express = require('express');
const homeController = require('../controllers/homeController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Home Route
 * /api/home:
 *   get:
 *     summary: Health Check
 *     tags: [Home]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *
 */
router.get('/', homeController.index);

module.exports = router;
