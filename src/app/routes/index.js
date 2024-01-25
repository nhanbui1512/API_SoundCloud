const homeRouter = require('./homeRoute');
const genreRouter = require('./genreRoute');

function route(app) {
  app.use('/home', homeRouter);
  app.use('/genre', genreRouter);
}

module.exports = route;
