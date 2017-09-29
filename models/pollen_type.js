'use strict';

module.exports = (sequelize, DataTypes) => {
  const PollenType = sequelize.define('pollen_type', {
    pollen_type_id: DataTypes.INTEGER,
    global_name: DataTypes.STRING,
    token: DataTypes.STRING,
  }, {
    underscored: true,
  });
  PollenType.associate = function(models) {
    // associations can be defined here
  };
  return PollenType;
};
