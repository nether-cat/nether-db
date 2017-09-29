'use strict';

module.exports = (sequelize, DataTypes) => {
  const XrfMethod = sequelize.define('xrf_method', {
    record_id: DataTypes.INTEGER,
    method_label: DataTypes.STRING,
    description: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  XrfMethod.associate = function(models) {
    // associations can be defined here
  };
  return XrfMethod;
};
