'use strict';

module.exports = (sequelize, DataTypes) => {
  const DiatomsType = sequelize.define('diatoms_type', {
    global_name: DataTypes.STRING,
    token: DataTypes.STRING,
  }, {
    underscored: true,
  });
  DiatomsType.associate = function(models) {
    DiatomsType.hasMany(models['diatoms_record']);
  };
  return DiatomsType;
};
