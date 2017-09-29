'use strict';

module.exports = (sequelize, DataTypes) => {
  const DiatomStatisticsRecord = sequelize.define('diatom_statistics_record', {
    record_id: DataTypes.INTEGER,
    composite_depth: DataTypes.DECIMAL,
    diatom_valve_concentration: DataTypes.DECIMAL,
    diatom_acc_rate: DataTypes.DECIMAL,
    diatom_chrysophyte_cysts_ratio: DataTypes.DECIMAL,
    f_index: DataTypes.DECIMAL,
    hills_n2_diversity_index: DataTypes.DECIMAL,
    sedimentation_rate: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  DiatomStatisticsRecord.associate = function(models) {
    // associations can be defined here
  };
  return DiatomStatisticsRecord;
};
