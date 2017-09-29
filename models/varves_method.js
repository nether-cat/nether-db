'use strict';

module.exports = (sequelize, DataTypes) => {
  const VarvesMethod = sequelize.define('varves_method', {
    record_id: DataTypes.INTEGER,
    method_label: DataTypes.STRING,
    description: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  VarvesMethod.associate = function(models) {
    // associations can be defined here
  };
  return VarvesMethod;
};
