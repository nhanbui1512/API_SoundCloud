const { DataTypes } = require('sequelize');

const UserLikeSong = (sequelize) => {
  return sequelize.define('userlikesongs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updateAt: {
      type: DataTypes.DATE,
    },
  });
};

module.exports = UserLikeSong;
