const fromEntries = require('object.fromentries');
const { default: chalk } = require('chalk');
const changeCase = require('change-case');
const latinize = require('latinize');

const neo4j = require('neo4j-driver');

/** @return {Session} */
function getDbSession () {
  /** @type {Driver} */ const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
      process.env.NEO4J_USER || 'neo4j',
      process.env.NEO4J_PASSWORD || 'neo4j',
    ),
  );
  return driver.session();
}

if (!Object.fromEntries) {
  fromEntries.shim();
}

const exitHandler = (db, status, taskStartTime) => () => {
  db.close();
  const taskEndTime = Date.now();
  const taskDuration = taskEndTime - taskStartTime;
  console.log(`Finished! Execution time was ${chalk.blueBright(taskDuration / 1000)} seconds.\n`);
  return status.get();
};

const normalize = s => changeCase.camelCase(latinize(s));

function cql (cypherQuery) {
  return String(cypherQuery);
}

function printStats (queryLabel, result) {
  let { summary: { counters: { _stats: statistics } } } = result;
  console.log('================================================================\n');
  console.log(`Stats for the query \`${chalk.cyan(queryLabel)}\`:\n`);
  Object.entries(statistics).forEach(([action, count]) => {
    console.log(` => ${changeCase.sentenceCase(action)}: ${count}`);
  });
  console.log('');
}

function printError (queryLabel, err) {
  console.log('================================================================\n');
  console.log(chalk.red(`Failure running the query \`${chalk.cyan(queryLabel)}\`:\n`));
  console.error(chalk.red(err.stack));
  console.log('');
}

function taskStatus () {
  return {
    _status: 0,
    set (code) {
      this._status = Math.floor(Number(code));
    },
    get () {
      return this._status;
    },
    hasError () {
      return this._status !== 0;
    },
  };
}

module.exports = { neo4j, getDbSession, cql, exitHandler, normalize, printStats, printError, taskStatus };
