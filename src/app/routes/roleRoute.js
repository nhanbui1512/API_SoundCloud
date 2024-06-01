const express = require('express');
const isLoginMiddleWare = require('../middlewares/isLoginMiddleware');
const { adminAuth } = require('../middlewares/rolesMiddleware');
const { createRoleValidation } = require('../Validations/roleValidation');
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
router.post('/', isLoginMiddleWare, adminAuth, createRoleValidation, RoleController.createRole);

module.exports = router;
