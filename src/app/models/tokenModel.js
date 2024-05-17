const { DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

function Token(sequelize) {
  return sequelize.define('tokens', {
    userId: {
      type: DataTypes.INTEGER,
    },
    accessToken: {
      type: DataTypes.STRING,
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
  });
}

module.exports = Token;
