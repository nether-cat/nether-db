'use strict';

module.exports = (sequelize, DataTypes) => {
  const DiatomsRecord = sequelize.define('diatoms_record', {
    record_id: DataTypes.INTEGER,
    composit_depth: DataTypes.DECIMAL(4,4),
    diatom_label_id: DataTypes.INTEGER,
    concentraion: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  DiatomsRecord.associate = function(models) {
    // associations can be defined here
  };
  return DiatomsRecord;
};
