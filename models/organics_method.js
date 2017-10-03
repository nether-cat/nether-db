'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrganicsMethod = sequelize.define('organics_method', {
    method_label: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  OrganicsMethod.associate = function(models) {
    OrganicsMethod.hasMany(models['organics_record']);
  };
  return OrganicsMethod;
};
