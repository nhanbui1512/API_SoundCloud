const express = require('express');
const isLoginMiddleWare = require('../middlewares/isLoginMiddleware');
const { adminAuth } = require('../middlewares/rolesMiddleware');
const { roleValidation } = require('../Validations/roleValidation');
const RoleController = require('../controllers/RoleController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Home Route
 * /api/role:
 *   post:
 *     summary: Create new Role
 *     tags: [Role]
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
 *                 description: "Name of Role"
 *             required:
 *               - name
 *     responses:
 *       '200':
 *          description: Successful
 *
 */
router.post('/', isLoginMiddleWare, adminAuth, roleValidation, RoleController.createRole);

/**
 * @swagger

 * /api/role:
 *   put:
 *     summary: Update role
 *     tags: [Role]
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
 *                 description: "Name of Role"
 *             required:
 *               - name
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 */
router.put('/', isLoginMiddleWare, adminAuth, roleValidation, RoleController.updateRole);

/**
 * @swagger

 * /api/role:
 *   get:
 *     summary: get roles
 *     tags: [Role]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/x-www-form-urlencoded:
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 */
router.get('/', isLoginMiddleWare, adminAuth, RoleController.getRoles);

module.exports = router;
