'use strict';

module.exports = (sequelize, DataTypes) => {
  const DiatomsType = sequelize.define('diatoms_type', {
    diatom_type_id: DataTypes.INTEGER,
    global_name: DataTypes.STRING,
    token: DataTypes.STRING,
  }, {
    underscored: true,
  });
  DiatomsType.associate = function(models) {
    // associations can be defined here
  };
  return DiatomsType;
};
