const express = require('express');
const homeController = require('../controllers/homeController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: The books managing API
 * /api/home:
 *   get:
 *     summary: Create a new book
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
