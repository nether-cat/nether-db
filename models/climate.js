'use strict';

module.exports = (sequelize, DataTypes) => {
  const Climate = sequelize.define('climate', {
    class_id: {type: DataTypes.STRING(3), primaryKey: true, comment: 'Class based on the Köppen climate scheme'},
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  Climate.associate = function(models) {
    Climate.hasMany(models['lake']);
  };
  return Climate;
};
