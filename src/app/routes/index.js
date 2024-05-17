const homeRouter = require('./homeRoute');
const genreRouter = require('./genreRoute');
const songRouter = require('./songRoute');
const userRouter = require('./userRoute');
const loginRouter = require('./loginRoute');
const listenRouter = require('./listenRoute');
const followRouter = require('./followRoute');
const playlistRouter = require('./playlistRoute');
const loopRouter = require('./loopRoute');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'SoundCloud API',
      version: '1.0.0',
      description: 'SoundCloud API Information',
      contact: {
        name: 'Developer',
      },
      servers: ['http://localhost:3000'],
    },
  },
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

function route(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
