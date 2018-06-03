'use strict';

module.exports = (seraphDb) => {
  const Lake = require('seraph-model')(seraphDb, 'Lake');
  Lake.schema = {
    name: String,
    latitude: Number,
    longitude: Number,
    surface_level: Number,
    max_depth: Number,
    surface_area: Number,
    conductivity_class: String,
  };
  Lake.usingWhitelist = true;
  Lake.useTimestamps();
  Lake.setup = function() {
    Lake.compose(this.db.models['User'], 'createdBy', 'CREATED_BY');
    Lake.compose(this.db.models['Country'], 'locatedIn', 'LOCATED_IN');
  };
  return Lake;
};
