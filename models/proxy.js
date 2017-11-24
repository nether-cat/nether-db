'use strict';

module.exports = (sequelize, DataTypes) => {
  const Proxy = sequelize.define('proxy', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  Proxy.associate = function(models) {
    Proxy.belongsTo(models['user'], {foreignKey: 'created_by'});
    Proxy.hasMany(models['collection']);
    Proxy.hasMany(models['attribute']);
  };
  return Proxy;
};
