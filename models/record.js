'use strict';

module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('record', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    type_id: DataTypes.INTEGER,
    method_id: DataTypes.INTEGER,
    publication_id: DataTypes.INTEGER,
    analysis_date: DataTypes.DATEONLY,
    data_description: DataTypes.TEXT,
    meta_information: DataTypes.TEXT,
    measuring_error: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  Record.associate = function(models) {
    Record.belongsTo(models['core']);
  };
  return Record;
};
