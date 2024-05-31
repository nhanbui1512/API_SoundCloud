const express = require('express');
const GenreController = require('../controllers/GenreController');
const enCodedToken = require('../middlewares/encodedToken');
const {
  genreValidation,
  getSongsValidation,
  deleteGenreValidation,
} = require('../Validations/genreValidation');
const isLoginMiddleWare = require('../middlewares/isLoginMiddleware');
const { adminAuth } = require('../middlewares/rolesMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Genre
 *   description: Genre APIs
 */

/**
 * @swagger

 * /api/genre/create:
 *   post:
 *     summary: Create a genre
 *     tags: [Genre]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Name of genre"
 *             required:
 *               - name
 *     responses:
 *       '200':
 *          description: Successful
 *       '404':
 *          description: Not Found Data
 */

router.post('/create', genreValidation, GenreController.create);

/**
 * @swagger

 * /api/genre/getall:
 *   get:
 *     summary: get all genres
 *     tags: [Genre]
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

router.get('/getall', GenreController.getAll);

/**
 * @swagger

 * /api/genre/get-songs:
 *   get:
 *     summary: get songs of genre by genre id
 *     tags: [Genre]
 *     parameters:
 *      - in: query
 *        name: id
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: genre id
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: page of songs
 *      - in: query
 *        name: per_page
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: number of songs
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

router.get('/get-songs', getSongsValidation, enCodedToken, GenreController.getSongsById);

/**
 * @swagger

 * /api/genre/{id}:
 *   delete:
 *     summary: Delete genre
 *     tags: [Genre]
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *          default: 1
 *        required: true
 *        description: genre id
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

router.delete(
  '/:id',
  isLoginMiddleWare,
  adminAuth,
  deleteGenreValidation,
  GenreController.deleteGenre,
);

module.exports = router;
