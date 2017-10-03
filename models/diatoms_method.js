'use strict';

module.exports = (sequelize, DataTypes) => {
  const DiatomsMethod = sequelize.define('diatoms_method', {
    method_label: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  DiatomsMethod.associate = function(models) {
    DiatomsMethod.hasMany(models['diatoms_record']);
  };
  return DiatomsMethod;
};
