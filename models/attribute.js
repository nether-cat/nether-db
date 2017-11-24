'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attribute = sequelize.define('attribute', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  Attribute.associate = function(models) {
    Attribute.belongsTo(models['user'], {foreignKey: 'created_by'});
    Attribute.belongsTo(models['proxy']);
    Attribute.belongsToMany(models['collection'], {through: 'collection_attributes'});
  };
  return Attribute;
};
