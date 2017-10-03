'use strict';

module.exports = (sequelize, DataTypes) => {
  const Publication = sequelize.define('publication', {
    title: DataTypes.STRING,
    authors: DataTypes.STRING,
    year: DataTypes.INTEGER,
    igbp_pages_wdca_contribution_series_number: DataTypes.STRING,
    wdc_paleo_contribution_series_citation: DataTypes.STRING,
    doi: DataTypes.STRING,
    source: DataTypes.STRING,
    url: DataTypes.STRING,
    email: DataTypes.STRING,
    abstract: DataTypes.TEXT,
  }, {
    underscored: true,
  });
  Publication.associate = function(models) {
    Publication.belongsTo(models['user'], {foreignKey: 'created_by'});
    Publication.hasMany(models['record']);
  };
  return Publication;
};
