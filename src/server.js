const express = require('express');
require('express-async-errors');

const app = express();
const path = require('path');
const route = require('./app/routes');
const cors = require('cors');
const errorHandle = require('./app/middlewares/errorHandler');
const { sequelize } = require('./app/models');
const { swaggerDocs } = require('./config/swagger');
const { logToFile } = require('./app/until/logsWriter');
const PORT = process.env.PORT || 3000;
require('./config/cloudinaryService'); // config dinary

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  }),
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to the database successfully');
    if (!process.env.dev) logToFile('Connect to database successfully');
    sequelize
      .sync({ alter: true })
      .then(() => {
        console.log('synced');
      })
      .catch((err) => {
        console.log(err);
        if (!process.env.dev) {
          logToFile(err);
        }
      });
  })
  .catch((err) => {
    console.log('Connected to the database unsuccessfully');
    if (!process.env.dev) {
      const errorDetails = `
      Lỗi: ${err.name}
      Thông điệp: ${err.message}
      Mã lỗi: ${err.original?.errno || 'N/A'}
      SQL Message: ${err.original?.sqlMessage || 'N/A'}
      Host: ${err.original?.address || 'N/A'}
      Port: ${err.original?.port || 'N/A'}
      Stack Trace: ${err.stack}
`;
      logToFile(errorDetails);
    }
  });

app.use(express.static(path.join(__dirname, '/Public')));
//config routes
route(app);
swaggerDocs(app);

app.use(errorHandle);

/// login with gg

app.listen(PORT, () => {
  console.log(`app is listening on http://localhost:${PORT}`);
  console.log(`API documentation at : http://localhost:${PORT}/docs`);
});
