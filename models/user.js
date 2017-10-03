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
    User.hasMany(models['lake'], {foreignKey: 'created_by'});
    User.hasMany(models['core'], {foreignKey: 'created_by'});
    User.hasMany(models['record'], {foreignKey: 'created_by'});
    User.hasMany(models['publication'], {foreignKey: 'created_by'});
  };
  return User;
};
