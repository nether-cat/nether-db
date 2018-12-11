const fs = require('fs');
const path = require('path');
const { makeAugmentedSchema } = require('neo4j-graphql-js');
const envHasSymbol = typeof Symbol === 'function' && Symbol.for;
const tooDeep = envHasSymbol ? Symbol.for('react.element') : 0xeac7;
const schemaFile = path.resolve(__dirname, '../schema.graphqls');
const typeDefs = fs.readFileSync(schemaFile, 'utf8');
const resolvers = require('../resolvers');
const config = {
  query: {
    exclude: [
      'Something',
    ],
  },
  mutation: {
    exclude: [
      'Something',
    ],
  },
};
const schema = makeAugmentedSchema({ typeDefs, resolvers, config });

module.exports = {
  schema: Object.assign(schema, { $$typeof: tooDeep }),
};
