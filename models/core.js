'use strict';

module.exports = (sequelize, DataTypes) => {
  const Core = sequelize.define('core', {
    label: DataTypes.STRING,
    latitude: DataTypes.DECIMAL(8, 6),
    longitude: DataTypes.DECIMAL(9, 6),
    coring_method: DataTypes.STRING, // TODO: Swap out to separate table
    water_depth: DataTypes.DECIMAL,
    composite_depth_start: DataTypes.DECIMAL,
    composite_depth_end: DataTypes.DECIMAL,
    length: DataTypes.DECIMAL,
    drill_date: DataTypes.DATEONLY,
  }, {
    underscored: true,
  });
  Core.associate = function(models) {
    Core.belongsTo(models['user'], {foreignKey: 'created_by'});
    Core.belongsTo(models['lake']);
    Core.hasMany(models['collection']);
  };
  return Core;
};
