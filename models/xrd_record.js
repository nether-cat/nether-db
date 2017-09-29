'use strict';

module.exports = (sequelize, DataTypes) => {
  const XrdRecord = sequelize.define('xrd_record', {
    record_id: DataTypes.INTEGER,
    method_xrd_id: DataTypes.INTEGER,
    composit_depth: DataTypes.DECIMAL,
    total_intensity: DataTypes.DECIMAL,
    pyrite_ti: DataTypes.DECIMAL,
    quarz_ti: DataTypes.DECIMAL,
    plagioclase_ti: DataTypes.DECIMAL,
    k_feldspar_ti: DataTypes.DECIMAL,
    mica_ti: DataTypes.DECIMAL,
    kaolinite_plus_chlorite_ti: DataTypes.DECIMAL,
    hornblende_ti: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  XrdRecord.associate = function(models) {
    // associations can be defined here
  };
  return XrdRecord;
};
