const { DataTypes } = require('sequelize');
const { formatTime, calculateTimeFromNow } = require('../until/time');
const dotenv = require('dotenv');
dotenv.config();

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
    numberOfListen: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    numberOfLoop: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    thumbNail: {
      type: DataTypes.STRING,
      get() {
        const filename = this.getDataValue('thumbNail');
        if (!filename) return filename;
        if (filename.includes('res.cloudinary.com') || filename.includes('sndcdn')) return filename;
        return `${process.env.domain}/uploads/images/${filename}`;
      },
    },
    linkFile: {
      type: DataTypes.STRING,
      get() {
        const filename = this.getDataValue('linkFile');
        if (!filename) return filename;
        if (filename.includes('res.cloudinary.com')) return filename;
        return `${process.env.domain}/uploads/audios/${filename}`;
      },
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

    durationTime: {
      type: DataTypes.VIRTUAL,
      get() {
        const duration = this.getDataValue('duration');
        const formatedTime = formatTime(duration * 1000);
        return `${formatedTime.minute}:${formatedTime.second}`;
      },
    },
    createAtTimeFormat: {
      type: DataTypes.VIRTUAL,
      get() {
        const time = this.getDataValue('createAt');
        const formatedTime = formatTime(time);
        return `${formatedTime.hour}:${formatedTime.minute} ${formatedTime.day}/${formatedTime.month}/${formatedTime.year}`;
      },
    },
    fromNow: {
      type: DataTypes.VIRTUAL,
      get() {
        const createdAt = this.getDataValue('createAt');
        return calculateTimeFromNow(createdAt);
      },
    },
  });
};

module.exports = Song;
