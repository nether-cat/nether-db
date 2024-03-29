const neo4j = require('neo4j-driver');

module.exports = {
  driver: neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
      process.env.NEO4J_USER || 'neo4j',
      process.env.NEO4J_PASSWORD || 'neo4j',
    ),
  ),
  neo4j,
};
