import { driver, neo4j } from './utils/neo4j';
import session from './utils/session';
import smtp from './utils/smtp';

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
export default async ({ req, connection }) => {
  const transport = await smtp;
  const ctx = {
    driver,
    neo4j,
    transport,
    req,
    connection,
  };
  ctx.session = await session.load(null, null, ctx);
  return ctx;
};
