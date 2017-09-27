'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Country', {
    code: {type: DataTypes.STRING(2), primaryKey: true},
    name: DataTypes.STRING,
    continent: DataTypes.STRING, // TODO: Swap out to separate table
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
};