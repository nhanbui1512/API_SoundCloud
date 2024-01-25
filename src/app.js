const express = require('express');
require('express-async-errors');

const app = express();
const path = require('path');
const route = require('./app/routes');
const cors = require('cors');
const errorHandle = require('./app/middlewares/errorHandler');
const { sequelize } = require('./app/models/');

app.use(cors());
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
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

app.use(express.static(path.join(__dirname, '/public')));

//config routes
route(app);

app.use(errorHandle);

app.listen(3000, () => {
  console.log('app is listening on http://localhost:3000');
});
