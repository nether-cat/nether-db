'use strict';

module.exports = (sequelize, DataTypes) => {
  const VarvesRecord = sequelize.define('varves_record', {
    composite_depth: DataTypes.DECIMAL,
    varve_no: DataTypes.INTEGER,
    varve_age_bp: DataTypes.DECIMAL,
    varve_thickness_total: DataTypes.DECIMAL,
    dark_layer_thickness: DataTypes.DECIMAL,
    light_layer_thickness: DataTypes.DECIMAL,
    diatom_thickness: DataTypes.DECIMAL,
    calcite_thickness: DataTypes.DECIMAL,
    organic_material_thickness: DataTypes.DECIMAL,
    precipitation_per_a: DataTypes.DECIMAL,
    comment: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  VarvesRecord.associate = function(models) {
    VarvesRecord.belongsTo(models['varves_method']);
    VarvesRecord.belongsTo(models['record']);
  };
  return VarvesRecord;
};
