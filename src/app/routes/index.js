const homeRouter = require('./homeRoute');
const genreRouter = require('./genreRoute');
const songRouter = require('./songRoute');
const userRouter = require('./userRoute')

function route(app) {
  app.use('/home', homeRouter);
  app.use('/genre', genreRouter);
  app.use('/song', songRouter);
  app.use('/user', userRouter);
}

module.exports = route;
