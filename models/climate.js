'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Climate', {
    koeppen_geiger_class: {type: DataTypes.STRING(3), primaryKey: true},
    description: DataTypes.TEXT,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
};