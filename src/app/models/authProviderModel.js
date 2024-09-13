const { DataTypes } = require('sequelize');

const authProvider = (sequelize) => {
  return sequelize.define('auth_providers', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    providerName: {
      type: DataTypes.STRING,
      field: 'provider_name',
    },
    providerUserId: {
      type: DataTypes.STRING,
      field: 'provider_user_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      default: new DataTypes.NOW(),
    },
  });
};

module.exports = authProvider;
