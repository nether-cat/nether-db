'use strict';

module.exports = (seraphDb) => {
  const Synonym = require('seraph-model')(seraphDb, 'Synonym');
  Synonym.schema = {
    name: {type: String, required: true},
    description: String,
  };
  Synonym.usingWhitelist = true;
  Synonym.useTimestamps();
  Synonym.setup = function() {
    Synonym.compose(this.db.models['User'], 'createdBy', 'CREATED_BY');
    Synonym.compose(this.db.models['Attribute'], 'refersTo', 'REFERS_TO');
  };
  return Synonym;
};
