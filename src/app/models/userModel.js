const { DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const { formatTime } = require('../until/time');
dotenv.config();

const User = (sequelize) => {
  return sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    bio: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    password: {
      type: DataTypes.STRING,
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: 'defaultAvatar.png',
      get() {
        const fileName = this.getDataValue('avatar');
        if (fileName === null) return fileName;
        return `${process.env.domain}/uploads/images/${fileName}`;
      },
    },
    createAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createAtFormatTime: {
      type: DataTypes.VIRTUAL,
      get() {
        const time = this.getDataValue(`createAt`);
        if (time === null) return time;
        const timeFormated = formatTime(time);
        return `${timeFormated.hour}:${timeFormated.minute}:${timeFormated.second} ${timeFormated.day}/${timeFormated.month}/${timeFormated.year}`;
      },
    },
    updateAt: {
      type: DataTypes.DATE,
    },
  });
};

module.exports = User;
