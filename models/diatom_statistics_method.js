'use strict';

module.exports = (sequelize, DataTypes) => {
  const DiatomStatisticsMethod = sequelize.define('diatom_statistics_method', {
    record_id: DataTypes.INTEGER,
    method_label: DataTypes.STRING,
    description: DataTypes.INTEGER,
  }, {
    underscored: true,
  });
  DiatomStatisticsMethod.associate = function(models) {
    // associations can be defined here
  };
  return DiatomStatisticsMethod;
};
