const express = require('express');
const GenreControler = require('../controllers/GenreController');
const enCodedToken = require('../middlewares/encodedToken');
const { genreValidation, getSongsValidation } = require('../Validations/genreValidation');

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

router.post('/create', genreValidation, GenreControler.create);

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

router.get('/getall', GenreControler.getAll);

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

router.get('/get-songs', getSongsValidation, enCodedToken, GenreControler.getSongsById);

module.exports = router;
