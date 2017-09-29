'use strict';

module.exports = (sequelize, DataTypes) => {
  const XrdMethod = sequelize.define('xrd_method', {
    record_id: DataTypes.INTEGER,
    method_label: DataTypes.STRING,
    description: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  XrdMethod.associate = function(models) {
    // associations can be defined here
  };
  return XrdMethod;
};
