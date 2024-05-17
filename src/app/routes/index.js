const homeRouter = require('./homeRoute');
const genreRouter = require('./genreRoute');
const songRouter = require('./songRoute');
const userRouter = require('./userRoute');
const loginRouter = require('./loginRoute');
const listenRouter = require('./listenRoute');
const followRouter = require('./followRoute');
const playlistRouter = require('./playlistRoute');
const loopRouter = require('./loopRoute');

function route(app) {
  app.use('/api/home', homeRouter);
  app.use('/api/genre', genreRouter);
  app.use('/api/song', songRouter);
  app.use('/api/user', userRouter);
  app.use('/api/login', loginRouter);
  app.use('/api/listen', listenRouter);
  app.use('/api/follow', followRouter);
  app.use('/api/playlist', playlistRouter);
  app.use('/api/loop', loopRouter);
}

module.exports = route;
