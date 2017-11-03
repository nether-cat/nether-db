'use strict';

module.exports = (sequelize, DataTypes) => {
  const DiatomStatisticsMethod = sequelize.define('diatom_statistics_method', {
    method_label: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  DiatomStatisticsMethod.associate = function(models) {
    DiatomStatisticsMethod.hasMany(models['diatom_statistics_record']);
  };
  return DiatomStatisticsMethod;
};
