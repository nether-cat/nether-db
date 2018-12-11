import driver from './utils/neo4j';

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
export default ({ req, connection }) => {
  return {
    driver,
    req,
    connection,
  };
};
