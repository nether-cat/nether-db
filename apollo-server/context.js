import { driver, neo4j } from './utils/neo4j';
const session = require('./utils/session');

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
export default ({ req, connection }) => {
  const ctx = {
    driver,
    neo4j,
    req,
    connection,
  };
  ctx.session = session.load(null, null, ctx);
  return ctx;
};
