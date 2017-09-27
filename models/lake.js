'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Lake', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    name: DataTypes.STRING,
    latitude: DataTypes.DECIMAL(8, 6),
    longitude: DataTypes.DECIMAL(9, 6),
    surface_level: DataTypes.DECIMAL,
    max_depth: DataTypes.DECIMAL,
    surface_area: DataTypes.DECIMAL,
    conductivity_category: DataTypes.STRING,
    climate_class: DataTypes.STRING(3),
    country_code: DataTypes.STRING(2),
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
};