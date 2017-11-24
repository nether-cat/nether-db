'use strict';

module.exports = (sequelize, DataTypes) => {
  const PollenMethod = sequelize.define('pollen_method', {
    method_label: DataTypes.TEXT,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  PollenMethod.associate = function(models) {
    PollenMethod.hasMany(models['pollen_record']);
  };
  return PollenMethod;
};
