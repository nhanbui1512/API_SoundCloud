const { DataTypes } = require('sequelize');

const Song = (sequelize) => {
  return sequelize.define('songs', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    numberListen: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    thumbNail: {
      type: DataTypes.STRING,
    },
    linkFile: {
      type: DataTypes.STRING,
    },
    artistName: {
      type: DataTypes.STRING,
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

module.exports = Song;
