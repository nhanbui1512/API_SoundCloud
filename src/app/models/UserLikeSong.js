const { DataTypes } = require('sequelize');
const { formatTime } = require('../until/time');

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
    likedAt: {
      type: DataTypes.VIRTUAL,
      get() {
        const time = this.getDataValue('createAt');
        if (time === null || !time) return time;
        const formated = formatTime(time);

        return `${formated.hour}:${formated.minute}:${formated.second} ${formated.day}/${formated.month}/${formated.year}`;
      },
    },
  });
};

module.exports = UserLikeSong;
