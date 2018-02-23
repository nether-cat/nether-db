'use strict';

module.exports = (seraphDb) => {
  const Collection = require('seraph-model')(seraphDb, 'Collection');
  Collection.schema = {
    label: String,
    analysis_date: Date,
    data_description: String,
    meta_information: String,
    measuring_error: Number,
  };
  Collection.usingWhitelist = true;
  Collection.useTimestamps();
  Collection.setup = function() {
    Collection.compose(this.db.models['User'], 'createdBy', 'CREATED_BY');
    Collection.compose(this.db.models['Core'], 'sampledFrom', 'SAMPLED_FROM');
    Collection.compose(this.db.models['Publication'], 'referencedBy', 'REFERENCED_BY', {many: true});
    Collection.compose(this.db.models['Proxy'], 'providesWith', 'PROVIDES_WITH');
    Collection.compose(this.db.models['Attribute'], 'includes', 'INCLUDES', {many: true});
  };
  return Collection;
};
