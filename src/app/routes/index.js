const homeRouter = require('./homeRoute');
const genreRouter = require('./genreRoute');
const songRouter = require('./songRoute');
const userRouter = require('./userRoute');
const listenRouter = require('./listenRoute');
const followRouter = require('./followRoute');
const playlistRouter = require('./playlistRoute');
const loopRouter = require('./loopRoute');
const authRouter = require('./authRoute');
const commentRouter = require('./commentRoute');
const roleRouter = require('./roleRoute');
const notiTypeRouter = require('./notiTypeRoute');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminAuth } = require('../middlewares/rolesMiddleware');

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
  app.use('/api/listen', listenRouter);
  app.use('/api/follow', followRouter);
  app.use('/api/playlist', playlistRouter);
  app.use('/api/loop', loopRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/comments', commentRouter);
  app.use('/api/role', roleRouter);
  app.use('/api/noti-type', authMiddleware, adminAuth, notiTypeRouter);
}

module.exports = route;
