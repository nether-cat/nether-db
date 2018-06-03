'use strict';

module.exports = (seraphDb) => {
  const Attribute = require('seraph-model')(seraphDb, 'Attribute');
  Attribute.schema = {
    name: {type: String, required: true},
    description: String,
  };
  Attribute.usingWhitelist = true;
  Attribute.useTimestamps();
  Attribute.setup = function() {
    Attribute.compose(this.db.models['User'], 'createdBy', 'CREATED_BY');
    Attribute.compose(this.db.models['Proxy'], 'characterizes', 'CHARACTERIZES');
  };
  return Attribute;
};
