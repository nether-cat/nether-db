'use strict';

module.exports = (seraphDb) => {
  const Core = require('seraph-model')(seraphDb, 'Core');
  Core.schema = {
    label: String,
    latitude: Number,
    longitude: Number,
    coring_method: String,
    drill_date: Date,
    water_depth: Number,
    composite_depth_start: Number, // TODO: Determine usage or removal
    composite_depth_end: Number, // TODO: Determine usage or removal
    length: Number, // TODO: Determine usage or removal
    age_depth_method: String,
    comments: String,
  };
  Core.usingWhitelist = true;
  Core.useTimestamps();
  Core.setup = function() {
    Core.compose(this.db.models['User'], 'createdBy', 'CREATED_BY');
    Core.compose(this.db.models['Lake'], 'drilledFrom', 'DRILLED_FROM');
  };
  return Core;
};
