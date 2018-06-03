'use strict';

module.exports = (seraphDb) => {
  const Record = require('seraph-model')(seraphDb, 'Record');
  Record.schema = {
    age: Number,
    depth: Number,
  };
  Record.usingWhitelist = false;
  Record.setup = function() {
    Record.compose(this.db.models['Collection'], 'belongsTo', 'BELONGS_TO');
  };
  return Record;
};
