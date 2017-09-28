'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    login_name: {type: DataTypes.STRING, primaryKey: true},
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    role: DataTypes.STRING,
    institution: DataTypes.STRING,
    department: DataTypes.STRING,
    email: {type: DataTypes.STRING, unique: true},
  }, {
    underscored: true,
  });
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
