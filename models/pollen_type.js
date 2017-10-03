'use strict';

module.exports = (sequelize, DataTypes) => {
  const PollenType = sequelize.define('pollen_type', {
    global_name: DataTypes.STRING,
    token: DataTypes.STRING,
  }, {
    underscored: true,
  });
  PollenType.associate = function(models) {
    PollenType.hasMany(models['pollen_record']);
  };
  return PollenType;
};
