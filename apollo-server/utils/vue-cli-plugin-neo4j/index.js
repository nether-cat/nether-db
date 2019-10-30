const path = require('path');
const publicDir = encodeURIComponent(path.resolve(__dirname));

const NEO4J_MIGRATION_TASK = /neo4j-cli-service migrate/;
const NEO4J_SEED_DATA_TASK = /neo4j-cli-service seed/;
const NEO4J_DUMP_DATA_TASK = /neo4j-cli-service dump/;
const NEO4J_DELETE_DB_TASK = /neo4j-cli-service reset/;

const taskCommon = {
  icon: `/_plugin/${publicDir}/neo4j-logo.png`,
  link: 'https://github.com/nether-cat/nether-db',
  prompts: [
    {
      name: 'node_debug',
      type: 'confirm',
      default: false,
      description: 'Inspect and break for debugging (port: 9229)',
    },
    {
      name: 'use_custom',
      type: 'confirm',
      default: false,
      description: 'Disregard environment and use custom connection',
    },
    {
      name: 'neo4j_host',
      type: 'input',
      default: 'bolt://localhost:7687',
      description: 'Provide the full URI for the Neo4j connection',
      group: 'Connection details',
      when: answers => answers['use_custom'],
    },
    {
      name: 'neo4j_user',
      type: 'input',
      default: 'neo4j',
      description: 'Specify the Neo4j user for authorization',
      group: 'Connection details',
      when: answers => answers['use_custom'],
    },
    {
      name: 'neo4j_password',
      type: 'password',
      default: 'neo4j',
      description: 'Enter the user\'s password for authorization',
      group: 'Connection details',
      when: answers => answers['use_custom'],
    },
  ],
  onBeforeRun: async ({ answers, args }) => {
    if (answers['use_custom']) {
      if (answers['neo4j_host']) {
        args.push('--host', answers['neo4j_host']);
        process.env.NEO4J_URI = answers['neo4j_host'];
      }
      if (answers['neo4j_user']) {
        process.env.NEO4J_USER = answers['neo4j_user'];
      }
      if (answers['neo4j_password']) {
        process.env.NEO4J_PASSWORD = answers['neo4j_password'];
      }
    }
    let index = args.findIndex(arg => '$NODE_DEBUG_OPTION' === arg);
    if (index !== -1) {
      if (answers['node_debug']) {
        args[index] = '--inspect-brk=9229';
      } else {
        args.splice(index, 1);
      }
    }
  },
  onRun: async () => {
    delete process.env.NEO4J_URI;
    delete process.env.NEO4J_USER;
    delete process.env.NEO4J_PASSWORD;
  },
};

module.exports = api => {
  api.describeTask({
    match: NEO4J_MIGRATION_TASK,
    description: 'Initializes and migrates your database for app usage',
    ...taskCommon,
  });
  api.describeTask({
    match: NEO4J_SEED_DATA_TASK,
    description: 'Adds example datasets to your database for app testing',
    ...taskCommon,
  });
  api.describeTask({
    match: NEO4J_SEED_DATA_TASK,
    description: 'Dumps all datasets from your database to ./live/export',
    ...taskCommon,
  });
  api.describeTask({
    match: NEO4J_DELETE_DB_TASK,
    description: 'Removes all nodes and constraints from your database',
    ...taskCommon,
  });
};
