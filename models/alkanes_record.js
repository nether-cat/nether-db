'use strict';

module.exports = (sequelize, DataTypes) => {
  const AlkanesRecord = sequelize.define('alkanes_record', {
    composite_depth: DataTypes.DECIMAL,
    sample_id: DataTypes.STRING,
    c23: DataTypes.DECIMAL,
    c25: DataTypes.DECIMAL,
    c237: DataTypes.DECIMAL,
    c29: DataTypes.DECIMAL,
    c31: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  AlkanesRecord.associate = function(models) {
    AlkanesRecord.belongsTo(models['alkanes_method']);
    AlkanesRecord.belongsTo(models['dataset']);
  };
  return AlkanesRecord;
};
