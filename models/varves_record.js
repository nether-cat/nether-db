'use strict';

module.exports = (sequelize, DataTypes) => {
  const VarvesRecord = sequelize.define('varves_record', {
    composite_depth: DataTypes.DECIMAL(4,4),
    varve_no: DataTypes.INTEGER,
    varve_age_bp: DataTypes.DECIMAL,
    varve_thick_total: DataTypes.DECIMAL,
    dark_layer_thick: DataTypes.DECIMAL,
    light_layer_thick: DataTypes.DECIMAL,
    diatom_thick: DataTypes.DECIMAL,
    calcite_thick: DataTypes.DECIMAL,
    org_mat_thick: DataTypes.DECIMAL,
    prec_per_a: DataTypes.DECIMAL,
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
