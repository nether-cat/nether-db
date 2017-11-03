'use strict';

module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('record', {
    age: DataTypes.DECIMAL,
    depth: DataTypes.DECIMAL,
    data: DataTypes.JSONB,
  }, {
    underscored: true,
  });
  Record.associate = function(models) {
    Record.belongsTo(models['collection']);
  };
  return Record;
};
