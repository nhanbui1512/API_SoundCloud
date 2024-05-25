const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Home Route
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       '200':
 *          description: Successful
 *
 */
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;
