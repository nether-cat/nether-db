'use strict';

module.exports = (sequelize, DataTypes) => {
  const XrdMethod = sequelize.define('xrd_method', {
    method_label: DataTypes.TEXT,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  XrdMethod.associate = function(models) {
    XrdMethod.hasMany(models['xrd_record']);
  };
  return XrdMethod;
};
