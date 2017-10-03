'use strict';

module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('record', {
    label: DataTypes.STRING,
    record_type: DataTypes.STRING,
    analysis_date: DataTypes.DATEONLY,
    data_description: DataTypes.TEXT,
    meta_information: DataTypes.TEXT,
    measuring_error: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  Record.associate = function(models) {
    Record.belongsTo(models['user'], {foreignKey: 'created_by'});
    Record.belongsTo(models['core']);
    Record.belongsTo(models['publication']);
  };
  return Record;
};
