'use strict';

module.exports = (sequelize, DataTypes) => {
  const Collection = sequelize.define('collection', {
    label: DataTypes.STRING,
    analysis_date: DataTypes.DATEONLY,
    data_description: DataTypes.TEXT,
    meta_information: DataTypes.TEXT,
    measuring_error: DataTypes.DECIMAL,
  }, {
    underscored: true,
  });
  Collection.associate = function(models) {
    Collection.belongsTo(models['user'], {foreignKey: 'created_by'});
    Collection.belongsTo(models['core']);
    Collection.belongsTo(models['publication']);
    Collection.belongsTo(models['proxy']);
    Collection.belongsToMany(models['property'], {through: 'collection_properties'});
    Collection.hasMany(models['record']);
  };
  return Collection;
};
