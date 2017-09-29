'use strict';

module.exports = (sequelize, DataTypes) => {
  const PollenRecord = sequelize.define('pollen_record', {
    record_id: DataTypes.INTEGER,
    method_pol_id: DataTypes.INTEGER,
    composit_depth: DataTypes.DECIMAL,
    pollen_type_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  PollenRecord.associate = function(models) {
    // associations can be defined here
  };
  return PollenRecord;
};
