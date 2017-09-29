'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrganicsMethod = sequelize.define('organics_method', {
    record_id: DataTypes.INTEGER,
    method_label: DataTypes.STRING,
    description: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  OrganicsMethod.associate = function(models) {
    // associations can be defined here
  };
  return OrganicsMethod;
};
