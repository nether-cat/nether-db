'use strict';

module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('country', {
    code: {type: DataTypes.STRING(2), primaryKey: true, comment: 'Country code based on ISO 3166-1 alpha-2'},
    name: DataTypes.STRING,
  }, {
    underscored: true,
  });
  Country.associate = function(models) {
    Country.hasMany(models['lake']);
  };
  return Country;
};
