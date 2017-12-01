'use strict';

module.exports = (sequelize, DataTypes) => {
  const Synonym = sequelize.define('synonym', {
    label: DataTypes.STRING,
  }, {
    underscored: true,
  });
  Synonym.associate = function(models) {
    Synonym.belongsTo(models['user'], {foreignKey: 'created_by'});
    Synonym.belongsTo(models['attribute']);
  };
  return Synonym;
};
