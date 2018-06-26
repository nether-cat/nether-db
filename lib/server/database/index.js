'use strict';

const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'neo4j'), {
  disableLosslessIntegers: true,
});

module.exports = driver || { close () {} };
