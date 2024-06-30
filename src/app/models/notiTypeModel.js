const { DataTypes } = require('sequelize');
const { formatTime } = require('../until/time');

const NotiType = (sequelize) => {
  return sequelize.define('noti_types', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    typeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updateAt: {
      type: DataTypes.DATE,
    },

    createAtFormatTime: {
      type: DataTypes.VIRTUAL,
      get() {
        const time = this.getDataValue('createAt');
        if (time === null || !time) return time;
        const formated = formatTime(time);

        return `${formated.hour}:${formated.minute}:${formated.second} ${formated.day}/${formated.month}/${formated.year}`;
      },
    },
    updateAtFormatTime: {
      type: DataTypes.VIRTUAL,
      get() {
        const time = this.getDataValue('updateAt');
        if (time === null || !time) return time;
        const formated = formatTime(time);

        return `${formated.hour}:${formated.minute}:${formated.second} ${formated.day}/${formated.month}/${formated.year}`;
      },
    },
  });
};

module.exports = NotiType;
