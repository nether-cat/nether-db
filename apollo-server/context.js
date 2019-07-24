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

async function updatePublications (publications) {
  let total = 0, successful = 0, updated = 0;
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
  /** @type Session */ let db = driver.session();
  let result = await db.run(`
    UNWIND $publications AS data
    MATCH (n0:Publication)
      WHERE n0.doi = data.doi
    SET n0.resolved = datetime(),
    n0.updated = n0.resolved,
    n0.citation = data.formattedCitation
    RETURN n0 AS publication
  `, { publications });
  publications = result.records.map(record => (
    { ...record.toObject()['publication']['properties'] }
  ));
  // eslint-disable-next-line no-cond-assign
  if (updated = publications.length) {
    if (updated < successful) {
      console.log(`${chalk.red('Warning:')} Only ${chalk.yellow(updated)} of the DOIs could be updated in the DB!`);
    } else {
      console.log(chalk.green('All of the queried DOIs have been updated in the DB!'));
    }
  }
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
