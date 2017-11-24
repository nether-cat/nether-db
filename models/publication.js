'use strict';

module.exports = (sequelize, DataTypes) => {
  const Publication = sequelize.define('publication', {
    title: DataTypes.TEXT,
    authors: DataTypes.TEXT,
    year: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    igbp_pages_wdca_contribution_series_number: DataTypes.TEXT,
    wdc_paleo_contribution_series_citation: DataTypes.TEXT,
    original_reference_citation: DataTypes.TEXT,
    doi: DataTypes.TEXT,
    source: DataTypes.TEXT,
    url: DataTypes.TEXT,
    email: DataTypes.TEXT,
    abstract: DataTypes.TEXT,
    note: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  Publication.associate = function(models) {
    Publication.belongsTo(models['user'], {foreignKey: 'created_by'});
    Publication.hasMany(models['collection']);
  };
  return Publication;
};
