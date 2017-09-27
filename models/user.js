'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    userName: {type: DataTypes.STRING, primaryKey: true},
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    role: DataTypes.STRING,
    institution: DataTypes.STRING,
    department: DataTypes.STRING,
    email: {type: DataTypes.STRING, unique: true},
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
};