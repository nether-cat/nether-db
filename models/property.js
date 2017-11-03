'use strict';

module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define('property', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  Property.associate = function(models) {
    Property.belongsTo(models['user'], {foreignKey: 'created_by'});
    Property.belongsTo(models['proxy']);
    Property.belongsToMany(models['collection'], {through: 'collection_properties'});
  };
  return Property;
};
