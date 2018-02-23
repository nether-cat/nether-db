'use strict';

module.exports = (seraphDb) => {
  const Proxy = require('seraph-model')(seraphDb, 'Proxy');
  Proxy.schema = {
    name: String,
    description: String,
  };
  Proxy.usingWhitelist = true;
  Proxy.useTimestamps();
  Proxy.setup = function() {
    Proxy.compose(this.db.models['User'], 'createdBy', 'CREATED_BY');
  };
  return Proxy;
};
