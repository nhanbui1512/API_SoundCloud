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

/**
 * @swagger

 * /api/auth/google:
 *   post:
 *     summary: Login by Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *             required:
 *               - token
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */
router.post('/google', AuthController.loginWithGoogle);

/**
 * @swagger

 * /api/auth/facebook:
 *   post:
 *     summary: Login by Facebook
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *             required:
 *               - token
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */
router.post('/facebook', AuthController.loginWithFacebook);

/**
 * @swagger

 * /api/auth/forgot-password:
 *   post:
 *     summary: Request forgot password
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
 *             required:
 *               - email
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */
router.post('/forgot-password', AuthController.forgotPassword);

module.exports = router;
