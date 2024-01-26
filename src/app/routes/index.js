const homeRouter = require('./homeRoute');
const genreRouter = require('./genreRoute');
const songRouter = require('./songRoute');
const userRouter = require('./userRoute');
const loginRouter = require('./loginRoute');

function route(app) {
  app.use('/home', homeRouter);
  app.use('/genre', genreRouter);
  app.use('/song', songRouter);
  app.use('/user', userRouter);
  app.use('/login', loginRouter);
}

module.exports = route;
