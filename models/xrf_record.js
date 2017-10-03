'use strict';

module.exports = (sequelize, DataTypes) => {
  const XrfRecord = sequelize.define('xrf_record', {
    composite_depth: DataTypes.DECIMAL,
    cu_area: DataTypes.DECIMAL,
    zn_area: DataTypes.DECIMAL,
    ga_area: DataTypes.DECIMAL,
    br_area: DataTypes.DECIMAL,
    rb_area: DataTypes.DECIMAL,
    sr_area: DataTypes.DECIMAL,
    y_area: DataTypes.DECIMAL,
    zr_area: DataTypes.DECIMAL,
    pb_area: DataTypes.DECIMAL,
    bi_area: DataTypes.DECIMAL,
    zr_rb: DataTypes.DECIMAL,
    zr_sr: DataTypes.DECIMAL,
    sr_rb: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  XrfRecord.associate = function(models) {
    XrfRecord.belongsTo(models['xrf_method']);
    XrfRecord.belongsTo(models['record']);
  };
  return XrfRecord;
};
