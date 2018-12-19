'use strict';

module.exports = (seraphDb) => {
  const Publication = require('seraph-model')(seraphDb, 'Publication');
  Publication.schema = {
    title: String,
    authors: String,
    year: Number,
    description: String, // TODO: Determine usage or removal
    original_reference_citation: String, // TODO: Determine usage or removal
    doi: String,
    source: String,
    url: String, // TODO: Determine usage or removal
    email: String,
    abstract: String,
  };
  Publication.usingWhitelist = true;
  Publication.useTimestamps();
  Publication.setup = function() {
    Publication.compose(this.db.models['User'], 'createdBy', 'CREATED_BY');
  };
  return Publication;
};
