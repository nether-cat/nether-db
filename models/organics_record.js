'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrganicsRecord = sequelize.define('organics_record', {
    record_id: DataTypes.INTEGER,
    method_org_id: DataTypes.INTEGER,
    composite_depth: DataTypes.DECIMAL,
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
    // associations can be defined here
  };
  return OrganicsRecord;
};
