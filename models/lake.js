'use strict';

module.exports = (sequelize, DataTypes) => {
  const Lake = sequelize.define('lake', {
    name: DataTypes.STRING,
    latitude: DataTypes.DECIMAL(8, 6),
    longitude: DataTypes.DECIMAL(9, 6),
    surface_level: DataTypes.DECIMAL,
    max_depth: DataTypes.DECIMAL,
    surface_area: DataTypes.DECIMAL,
    conductivity_class: DataTypes.STRING,
  }, {
    underscored: true,
  });
  Lake.associate = function(models) {
    Lake.belongsTo(models['user'], {foreignKey: 'created_by'});
    Lake.belongsTo(models['country']);
    Lake.hasMany(models['core']);
  };
  return Lake;
};
