'use strict';

module.exports = (sequelize, DataTypes) => {
  const Core = sequelize.define('core', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    label: DataTypes.STRING,
    latitude: DataTypes.DECIMAL(8, 6),
    longitude: DataTypes.DECIMAL(9, 6),
    core_type: DataTypes.STRING, // TODO: Swap out to separate table
    water_depth: DataTypes.DECIMAL,
    depth_start: DataTypes.DECIMAL,
    depth_end: DataTypes.DECIMAL,
    core_length: DataTypes.DECIMAL, // TODO: Compute this value
    drill_date: DataTypes.DATEONLY,
  }, {
    underscored: true,
  });
  Core.associate = function(models) {
    Core.belongsTo(models['lake']);
    Core.hasMany(models['record']);
  };
  return Core;
};
