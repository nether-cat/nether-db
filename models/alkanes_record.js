'use strict';

module.exports = (sequelize, DataTypes) => {
  const AlkanesRecord = sequelize.define('alkanes_record', {
    record_id: DataTypes.INTEGER,
    method_alk_id: DataTypes.INTEGER,
    sample_id: DataTypes.STRING,
    composit_depth: DataTypes.DECIMAL,
    c23: DataTypes.DECIMAL,
    c25: DataTypes.DECIMAL,
    c237: DataTypes.DECIMAL,
    c29: DataTypes.DECIMAL,
    c31: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  AlkanesRecord.associate = function(models) {
    // associations can be defined here
  };
  return AlkanesRecord;
};
