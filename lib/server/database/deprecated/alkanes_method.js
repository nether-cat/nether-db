'use strict';

module.exports = (sequelize, DataTypes) => {
  const AlkanesMethod = sequelize.define('alkanes_method', {
    method_label: DataTypes.TEXT,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  AlkanesMethod.associate = function(models) {
    AlkanesMethod.hasMany(models['alkanes_record']);
  };
  return AlkanesMethod;
};
