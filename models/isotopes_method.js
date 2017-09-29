'use strict';

module.exports = (sequelize, DataTypes) => {
  const IsotopesMethod = sequelize.define('isotopes_method', {
    record_id: DataTypes.INTEGER,
    method_label: DataTypes.STRING,
    description: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  IsotopesMethod.associate = function(models) {
    // associations can be defined here
  };
  return IsotopesMethod;
};
