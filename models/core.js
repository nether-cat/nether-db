'use strict';

module.exports = (seraphDb) => {
  const Core = require('seraph-model')(seraphDb, 'Core');
  Core.schema = {
    label: String,
    latitude: Number,
    longitude: Number,
    coring_method: String,
    water_depth: Number,
    composite_depth_start: Number,
    composite_depth_end: Number,
    length: Number,
    drill_date: Date,
  };
  Core.usingWhitelist = true;
  Core.useTimestamps();
  Core.setup = function() {
    Core.compose(this.db.models['User'], 'createdBy', 'CREATED_BY');
    Core.compose(this.db.models['Lake'], 'drilledFrom', 'DRILLED_FROM');
  };
  return Core;
};
