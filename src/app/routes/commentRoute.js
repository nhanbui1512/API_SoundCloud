const expresss = require('express');
const CommentController = require('../controllers/CommentController');
const authMiddleware = require('../middlewares/authMiddleware');
const validation = require('../Validations/commentValidation');
const router = expresss.Router();

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: comment APIs
 */

/**
 * @swagger

 * /api/comments:
 *   get:
 *     summary: get comments of song
 *     tags: [Comment]
 *     parameters:
 *      - in: query
 *        name: song_id
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: id of song
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *        required: false
 *        description: page of comment list
 *      - in: query
 *        name: per_page
 *        schema:
 *          type: integer
 *          default: 1
 *        required: false
 *        description: number of comments per one page
 *      - in: query
 *        name: comment_id
 *        schema:
 *          type: integer
 *          default: 1
 *        required: false
 *        description: get replyed comments of comment
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

router.get('/', validation.get, CommentController.getComments);

/**
 * @swagger

 * /api/comments:
 *   post:
 *     summary: Create a comment
 *     tags: [Comment]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               song_id:
 *                 type: integer
 *                 description: "id of song"
 *               content:
 *                 type: string
 *                 description: "content of the comment"
 *               comment_id:
 *                 type: integer
 *                 description: "id of replied comment (if it's a parent comment, comment_id is null)"
 *             required:
 *               - song_id
 *               - content
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 */

router.post('/', authMiddleware, validation.create, CommentController.createComment);

/**
 * @swagger

 * /api/comments:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comment]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: comment_id
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: id of comment
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

router.delete('/', authMiddleware, validation.delete, CommentController.delete);

/**
 * @swagger

 * /api/comments:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comment]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               comment_id:
 *                 type: integer
 *                 description: "id of comment"
 *               content:
 *                 type: string
 *                 description: "content of the comment"
 *             required:
 *               - comment_id
 *               - content
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 */
router.patch('/', authMiddleware, CommentController.update);

/**
 * @swagger
 * tags:
 *   name: Comment
 * /api/comments/{id}:
 *   get:
 *     summary: Get Comment by id
 *     tags: [Comment]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: id comment
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 *
 */
router.get('/:id', validation.getById, CommentController.getById);

module.exports = router;
