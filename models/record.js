'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Record', {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    core_id: DataTypes.INTEGER,
    type_id: DataTypes.INTEGER,
    method_id: DataTypes.INTEGER,
    publication_id: DataTypes.INTEGER,
    analysis_date: DataTypes.DATEONLY,
    data_description: DataTypes.TEXT,
    meta_information: DataTypes.TEXT,
    measuring_error: DataTypes.DECIMAL,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
};