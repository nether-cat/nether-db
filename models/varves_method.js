'use strict';

module.exports = (sequelize, DataTypes) => {
  const VarvesMethod = sequelize.define('varves_method', {
    method_label: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  VarvesMethod.associate = function(models) {
    VarvesMethod.hasMany(models['varves_record']);
  };
  return VarvesMethod;
};
