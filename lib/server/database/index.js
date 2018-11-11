'use strict';

const neo4j = require('neo4j-driver').v1;
const config = require('../../../config');

const authToken = neo4j.auth.basic(
  config.neo4j.username,
  config.neo4j.password,
);

const driver = neo4j.driver(config.neo4j.url, authToken, {
  connectionTimeout: 30 * 1000,
  connectionAcquisitionTimeout: 15 * 1000,
  maxTransactionRetryTime: 30 * 1000,
  maxConnectionLifetime: 900 * 1000,
  maxConnectionPoolSize: 600,
  disableLosslessIntegers: true,
});

module.exports = driver || { close () {} };
