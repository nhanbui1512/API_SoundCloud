const { DataTypes } = require('sequelize');

const FollowPlaylist = (sequelize) => {
  return sequelize.define('follow_playlists', {
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

module.exports = FollowPlaylist;
