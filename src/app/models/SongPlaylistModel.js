const { DataTypes } = require('sequelize');

const SongPlaylist = (sequelize) => {
  return sequelize.define('song_playlist', {
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

module.exports = SongPlaylist;
