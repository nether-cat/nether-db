import chalk from 'chalk';
import { camelCase } from 'change-case';
import { driver, neo4j } from './utils/neo4j';
import session from './utils/session';
import smtp from './utils/smtp';
import doi from './utils/doi';

async function fetchPublications () {
  /** @type Session */ let db = driver.session();
  let queryResult = await db.run(`
    MATCH (n0:Publication)
    WHERE n0.doi IS NOT NULL AND (n0.resolved IS NULL OR n0.resolved < (datetime() - duration('P28D')))
    RETURN collect(n0.doi) AS publications
  `);
  let [record] = queryResult.records;
  let publications = await Promise.all(
    record.get('publications').map(ref => doi.resolve(ref)),
  );
  return publications;
}

function updatePublications (publications) {
  let total = 0, successful = 0;
  publications = publications.map(pub => Object.fromEntries(
    Object.entries(pub).map(([key, value]) => [camelCase(key), value]),
  ));
  // eslint-disable-next-line no-cond-assign
  if (total = publications.length) {
    console.log(`Finished querying metadata for a total of ${chalk.yellow(publications.length)} DOIs \\o/`);
  } else {
    return total;
  }
  publications = publications.filter(pub => !pub.hasError);
  // eslint-disable-next-line no-cond-assign
  if (successful = publications.length) {
    if (successful === total) {
      console.log(chalk.green('All of the performed queries have been successful!'));
    } else {
      console.log(`It seems that ${chalk.green(successful)} of the queries have been successful.`);
    }
  } else {
    console.log(`However ${chalk.red('0')} of the performed queries were successful :-/`);
  }
  // TODO: Update database contents with the retrieved citations
}

fetchPublications().then(updatePublications);

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
