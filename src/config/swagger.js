const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hero API',
      description: 'Example of CRUD API ',
      version: '1.0.0',
    },
  },
  // looks for configuration in specified directories
  apis: ['./src/app/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

// console.log(path.join(__dirname, '/Public'));
function swaggerDocs(app) {
  // Swagger Page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

  // Documentation in JSON format
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = { swaggerDocs };
