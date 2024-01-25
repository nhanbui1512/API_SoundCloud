const dotenv = require('dotenv');
dotenv.config();

const host = process.env.HOST_MYSQL;
const dbName = process.env.DB_NAME;
const userName = process.env.USER_NAME;
const password = process.env.PASS_MYSQL;

const local = {
  dbName: 'sound_cloud',
  userName: 'root',
  password: '',

  config: {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  },
};

const cloud = {
  dbName: dbName,
  userName: userName,
  password: password,

  config: {
    host: host,
    dialect: 'mysql',
    logging: false,
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  },
};

module.exports = {
  local,
  cloud,
};
