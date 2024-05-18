const express = require('express');
require('express-async-errors');

const app = express();
const path = require('path');
const route = require('./app/routes');
const cors = require('cors');
const errorHandle = require('./app/middlewares/errorHandler');
const { sequelize } = require('./app/models');
const { swaggerDocs } = require('./config/swagger');
const PORT = process.env.PORT || 3000;
require('./config/cloudinaryService'); // config dinary

app.use(cors());
app.use(express.json());

app.use(
  express.urlencoded({
    extended: false,
  }),
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to the database successfully');
    sequelize
      .sync({ alter: true })
      .then(() => {
        console.log('synced');
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log('Connected to the database unsuccessfully');
  });

app.use(express.static(path.join(__dirname, '/Public')));
//config routes
route(app);
swaggerDocs(app);

app.use(errorHandle);

/// login with gg

app.listen(PORT, () => {
  console.log('app is listening on http://localhost:3000');
  console.log('API documentation at : http://localhost:3000/docs');
});
