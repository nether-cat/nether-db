'use strict';

module.exports = (seraphDb) => {
  const Publication = require('seraph-model')(seraphDb, 'Publication');
  Publication.schema = {
    title: String,
    authors: String,
    year: Number,
    description: String,
    igbp_pages_wdca_contribution_series_number: String,
    wdc_paleo_contribution_series_citation: String,
    original_reference_citation: String,
    doi: String,
    source: String,
    url: String,
    email: String,
    abstract: String,
    note: String,
  };
  Publication.usingWhitelist = true;
  Publication.useTimestamps();
  Publication.setup = function() {
    Publication.compose(this.db.models['User'], 'createdBy', 'CREATED_BY');
  };
  return Publication;
};
