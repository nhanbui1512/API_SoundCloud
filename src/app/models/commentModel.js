const { DataTypes } = require('sequelize');
const { formatTime, calculateTimeFromNow } = require('../until/time');

const Comment = (sequelize) => {
  return sequelize.define('comments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
    },
    createAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updateAt: {
      type: DataTypes.DATE,
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

module.exports = Comment;
