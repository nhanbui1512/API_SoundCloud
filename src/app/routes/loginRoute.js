const express = require('express');
const LoginController = require('../controllers/LoginController');
const { loginValidation } = require('../Validations/loginValidation');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Auth managing API
 */

/**
 * @swagger

 * /api/login:
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

router.post('/', loginValidation, LoginController.checkLogin);

module.exports = router;
