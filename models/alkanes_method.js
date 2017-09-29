'use strict';

module.exports = (sequelize, DataTypes) => {
  const AlkanesMethod = sequelize.define('alkanes_method', {
    record_id: DataTypes.INTEGER,
    method_label: DataTypes.STRING,
    description: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  AlkanesMethod.associate = function(models) {
    // associations can be defined here
  };
  return AlkanesMethod;
};
