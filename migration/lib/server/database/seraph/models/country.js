'use strict';

module.exports = (seraphDb) => {
  const Country = require('seraph-model')(seraphDb, 'Country');
  Country.schema = {
    code: {type: String, required: true}, // Country code according to ISO 3166-1 alpha-2
    name: {type: String, required: true}, // English short country name used by ISO 3166/MA
  };
  Country.usingWhitelist = true;
  Country.useTimestamps();
  return Country;
};
