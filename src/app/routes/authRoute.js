const express = require('express');
const AuthController = require('../controllers/AuthController');
const { loginValidation } = require('../Validations/loginValidation');
const LoginController = require('../controllers/LoginController');

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

/**
 * @swagger

 * /api/auth/login:
 *   post:
 *     summary: Login by email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 default: "user@gmail.com"
 *               password: 
 *                 type: string
 *                 default: "password"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */

router.post('/login', loginValidation, LoginController.checkLogin);

module.exports = router;
