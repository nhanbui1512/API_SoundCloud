const homeRouter = require('./homeRoute');
const genreRouter = require('./genreRoute');
const songRouter = require('./songRoute');

function route(app) {
  app.use('/home', homeRouter);
  app.use('/genre', genreRouter);
  app.use('/song', songRouter);
}

module.exports = route;
