'use strict';

module.exports = (sequelize, DataTypes) => {
  const PollenRecord = sequelize.define('pollen_record', {
    depth: DataTypes.DECIMAL,
    quantity: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  PollenRecord.associate = function(models) {
    PollenRecord.belongsTo(models['pollen_method']);
    PollenRecord.belongsTo(models['pollen_type']);
    PollenRecord.belongsTo(models['collection']);
  };
  return PollenRecord;
};
