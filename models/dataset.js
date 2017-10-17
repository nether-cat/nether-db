'use strict';

module.exports = (sequelize, DataTypes) => {
  const Dataset = sequelize.define('dataset', {
    label: DataTypes.STRING,
    record_type: DataTypes.STRING,
    analysis_date: DataTypes.DATEONLY,
    depth_start: DataTypes.DECIMAL,
    depth_end: DataTypes.DECIMAL,
    length: DataTypes.DECIMAL,
    data_description: DataTypes.TEXT,
    meta_information: DataTypes.TEXT,
    measuring_error: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  Dataset.associate = function(models) {
    Dataset.belongsTo(models['user'], {foreignKey: 'created_by'});
    Dataset.belongsTo(models['core']);
    Dataset.belongsTo(models['publication']);
  };
  return Dataset;
};
