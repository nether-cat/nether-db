'use strict';

module.exports = (sequelize, DataTypes) => {
  const PollenMethod = sequelize.define('pollen_method', {
    record_id: DataTypes.INTEGER,
    method_label: DataTypes.STRING,
    description: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  PollenMethod.associate = function(models) {
    // associations can be defined here
  };
  return PollenMethod;
};
