const fs = require('fs');
const path = require('path');
const { makeAugmentedSchema } = require('neo4j-graphql-js');
// TODO: Build custom resolvers instead of using `neo4j-graphql-js`
const envHasSymbol = typeof Symbol === 'function' && Symbol.for;
const notCloneable = envHasSymbol ? Symbol.for('react.element') : 0xeac7;
const schemaFile = path.resolve(__dirname, '../schema.graphql');
const typeDefs = fs.readFileSync(schemaFile, 'utf8');
const resolvers = require('../resolvers');
const schemaDirectives = require('../directives');
const config = {
  query: {
    exclude: [
      'Session', 'Record',
    ],
  },
  mutation: {
    exclude: [
      'Session', 'Record',
    ],
  },
};
const schema = makeAugmentedSchema({ typeDefs, resolvers, schemaDirectives, config });

module.exports = {
  schema: Object.assign(schema, { $$typeof: notCloneable }),
};
