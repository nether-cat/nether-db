'use strict';

module.exports = (sequelize, DataTypes) => {
  const XrfMethod = sequelize.define('xrf_method', {
    method_label: DataTypes.TEXT,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  XrfMethod.associate = function(models) {
    XrfMethod.hasMany(models['xrf_record']);
  };
  return XrfMethod;
};
