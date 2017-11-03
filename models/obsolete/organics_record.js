'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrganicsRecord = sequelize.define('organics_record', {
    depth: DataTypes.DECIMAL,
    nitrogen_tn: DataTypes.DECIMAL,
    total_carbon_tc: DataTypes.DECIMAL,
    total_organic_carbon_toc: DataTypes.DECIMAL,
    total_inorganic_carbon_tic: DataTypes.DECIMAL,
    toc_tn_atomic_ratio: DataTypes.DECIMAL,
    d13c_o_oo_vs: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  OrganicsRecord.associate = function(models) {
    OrganicsRecord.belongsTo(models['organics_method']);
    OrganicsRecord.belongsTo(models['collection']);
  };
  return OrganicsRecord;
};
