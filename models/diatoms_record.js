'use strict';

module.exports = (sequelize, DataTypes) => {
  const DiatomsRecord = sequelize.define('diatoms_record', {
    depth: DataTypes.DECIMAL,
    concentration: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  DiatomsRecord.associate = function(models) {
    DiatomsRecord.belongsTo(models['diatoms_method']);
    DiatomsRecord.belongsTo(models['diatoms_type']);
    DiatomsRecord.belongsTo(models['dataset']);
  };
  return DiatomsRecord;
};
