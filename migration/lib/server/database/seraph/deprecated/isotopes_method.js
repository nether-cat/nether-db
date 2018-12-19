'use strict';

module.exports = (sequelize, DataTypes) => {
  const IsotopesMethod = sequelize.define('isotopes_method', {
    method_label: DataTypes.TEXT,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  IsotopesMethod.associate = function(models) {
    IsotopesMethod.hasMany(models['isotopes_record']);
  };
  return IsotopesMethod;
};
