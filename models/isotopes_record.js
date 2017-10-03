'use strict';

module.exports = (sequelize, DataTypes) => {
  const IsotopesRecord = sequelize.define('isotopes_record', {
    composite_depth: DataTypes.DECIMAL,
    c23_dd: DataTypes.DECIMAL,
    c23dd_std_dev: DataTypes.DECIMAL,
    c29_dd: DataTypes.DECIMAL,
    c29dd_std_dev: DataTypes.DECIMAL,
    c31_dd: DataTypes.DECIMAL,
    c31dd_std_dev: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  IsotopesRecord.associate = function(models) {
    IsotopesRecord.belongsTo(models['isotopes_method']);
    IsotopesRecord.belongsTo(models['record']);
  };
  return IsotopesRecord;
};
