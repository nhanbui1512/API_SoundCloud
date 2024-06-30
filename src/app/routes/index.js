const homeRouter = require('./homeRoute');
const genreRouter = require('./genreRoute');
const songRouter = require('./songRoute');
const userRouter = require('./userRoute');
const loginRouter = require('./loginRoute');
const listenRouter = require('./listenRoute');
const followRouter = require('./followRoute');
const playlistRouter = require('./playlistRoute');
const loopRouter = require('./loopRoute');
const authRouter = require('./authRoute');
const commentRouter = require('./commentRoute');

/**
 * @swagger
 *components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *
 */
function route(app) {
  app.use('/api/', homeRouter);
  app.use('/api/genre', genreRouter);
  app.use('/api/song', songRouter);
  app.use('/api/user', userRouter);
  app.use('/api/login', loginRouter);
  app.use('/api/listen', listenRouter);
  app.use('/api/follow', followRouter);
  app.use('/api/playlist', playlistRouter);
  app.use('/api/loop', loopRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/comments', commentRouter);
}

module.exports = route;
