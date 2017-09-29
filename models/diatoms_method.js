'use strict';

module.exports = (sequelize, DataTypes) => {
  const DiatomsMethod = sequelize.define('diatoms_method', {
    record_id: DataTypes.INTEGER,
    method_label: DataTypes.STRING,
    description: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  DiatomsMethod.associate = function(models) {
    // associations can be defined here
  };
  return DiatomsMethod;
};
