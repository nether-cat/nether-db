'use strict';

const neo4j = require('neo4j-driver').v1;
const config = require('../../../config');

const authToken = neo4j.auth.basic(
  config.neo4j.username,
  config.neo4j.password,
);

const driver = neo4j.driver(config.neo4j.url, authToken, {
  disableLosslessIntegers: true,
});

module.exports = driver || { close () {} };
