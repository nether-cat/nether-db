const taskStartTime = Date.now();

const fs = require('fs');
const path = require('path');
const util = require('util');
const https = require('https');
const ms = require('ms');
const xlsx = require('xlsx');
const latinize = require('latinize');
const changeCase = require('change-case');
const { default: chalk } = require('chalk');
const { v1: neo4j } = require('neo4j-driver');
const countriesList = require('countries-list');
const fromEntries = require('object.fromentries');

if (!Object.fromEntries) {
  fromEntries.shim();
}

// TODO: Instantiate driver with the provided arguments

/** @type {Driver} */ const database = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j',
  ),
);
/** @type {Session} */ const session = database.session();

const normalize = s => changeCase.camelCase(latinize(s));

const mappedProps = {
  // core
  'coringMethod': '@core.coringMethod',
  'drillDate': '@core.drillDate',
  'waterDepth': '@core.waterDepth',
  'ageDepthMethod': '@core.ageDepthMethod',
  // dataset
  'nameOfDataset': 'label',
  'analysisMethod': 'analysisMethod',
};

const datasetsOrder = (a, b) => {
  return (
    (!a['_fileExists'] - !b['_fileExists']) ||
    (!a['_lakeExists'] - !b['_lakeExists']) ||
    a['@lake.name'].localeCompare(b['@lake.name']) ||
    a['@category.name'].localeCompare(b['@category.name']) ||
    a['file'].localeCompare(b['file'])
  );
};

const status = {
  _status: 0,
  /**
   * @param {Number|Boolean} id
   */
  set (id) {
    this._status = Math.floor(Number(id));
  },
  /**
   * @returns {Number}
   */
  get () {
    return this._status;
  },
  /**
   * @returns {Boolean}
   */
  hasError () {
    return this._status !== 0;
  },
};

module.exports = async function taskSeed ({ host, user, password }) {
  if (password) console.log(`Using host ${chalk.underline(host)} with user ${chalk.underline(user)}.\n`);
  else throw new Error('No password has been provided');

  const onExitTask = () => {
    session.close();
    const taskEndTime = Date.now();
    const taskDuration = taskEndTime - taskStartTime;
    console.log(`Finished! Execution time was ${chalk.blueBright(taskDuration / 1000)} seconds.\n`);
    return status.get();
  };

  /** @type Array */ let continents, countries;
  /** @type Array */ let lakes = require('./seeds/lakes');
  /** @type Array */ let datasets = require('./seeds/datasets');

  console.log('Looking for all referenced dataset files...\n');

  datasets.forEach(checkFileExists);
  datasets.forEach(checkLakeExists, lakes);
  datasets.forEach(addMoreProps);
  datasets.forEach(sortProperties);

  console.log('');

  let lakeStats = datasets.reduce((lakeStats, dataset) => {
    let suffix = dataset['@lake.@countries']
      ? ' (' + dataset['@lake.@countries'].join(', ') + ')'
      : ' (' + lakes.find(l => l.name === dataset['@lake.name'])['@countries'].join(', ') + ')';
    !lakeStats[dataset['@lake.name'] + suffix]
      ? lakeStats[dataset['@lake.name'] + suffix] = 1
      : lakeStats[dataset['@lake.name'] + suffix]++;
    return lakeStats;
  }, {});

  let lakesWithData = Object.values(lakeStats);
  let average = Object.values(lakeStats).reduce((sum, add) => sum + add, 0) / lakesWithData.length;

  console.log(`Indexed ${chalk.blueBright(String(lakes.length - lakesWithData.length))} lakes without datasets.\n`);
  console.log(`Processed datasets covering ${chalk.blueBright(String(lakesWithData.length))} lakes.\n`);
  console.log(`The total number of datasets is ${chalk.blueBright(String(datasets.length))} now.\n`);
  console.log(`That results in ${chalk.blueBright('~' + average.toFixed(2))} datasets per covered lake.\n`);

  const actualFile = path.resolve(__dirname, './seeds/datasets.json');
  const backupFile = path.resolve(__dirname, './seeds/datasets.bak.json');
  const updatedDatasetsJSON = JSON.stringify(datasets.sort(datasetsOrder), null, 2);
  fs.copyFileSync(actualFile, backupFile);
  fs.writeFileSync(actualFile, updatedDatasetsJSON + '\n');

  continents = Object.entries(countriesList.continents)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a['code'].localeCompare(b['code']));

  countries = Object.values(
    lakes.reduce((results, lake) => {
      lake['@countries'].forEach(code => results[code] = results[code] || {
        'code': code,
        'name': countriesList.countries[code].name,
        '@continent.code': countriesList.countries[code].continent,
      });
      return results;
    }, {}),
  ).sort((a, b) => a['code'].localeCompare(b['code']));

  datasets = datasets.filter(d => d['_fileExists'] && d['_lakeExists']);
  datasets.forEach(dataset => {
    const structuredObj = Object.entries(dataset).reduce((obj, [key, value]) => {
      let [, ref, prop] = key.match(/^(@\w+)\.(\w+)$/) || [];
      if (ref && prop) {
        obj[ref] = Object.assign(obj[ref] || {}, { [prop]: value });
      } else if (!key.match(/^_/g)) {
        obj['@dataset'][key] = value;
      }
      return obj;
    }, {
      '@dataset': {},
      '@core': {},
      '@lake': {},
      '@category': { name: 'Unknown' },
      '@publication': {},
    });
    Object.keys(dataset).forEach(key => delete dataset[key]);
    Object.assign(dataset, structuredObj);
  });

  await executeQuery({
    label: 'Add continents and countries',
    params: { continents, countries },
    statement: cql`
      UNWIND $continents AS data
      MERGE (n:Continent:Entity {code: data.code})
        ON CREATE SET n += data, n.uuid = randomUUID()
        ON MATCH SET n.name = data.name
      WITH n AS n0
      UNWIND $countries AS data
      MERGE (n:Country:Entity {code: data.code})
        ON CREATE SET n.name = data.name, n.uuid = randomUUID()
        ON MATCH SET n.name = data.name
      WITH n AS n1, n0, data
      MATCH (n2:Continent {code: data.\`@continent.code\`})
      MERGE (n1)-[:LOCATED_IN]->(n2)
      RETURN
        collect(DISTINCT n0) AS continents,
        collect(DISTINCT n1) AS countries
    `,
  }).catch(() => status.set(0x2));

  if (status.hasError()) return onExitTask();

  await executeQuery({
    label: 'Add all known lakes',
    params: { lakes },
    statement: cql`
      UNWIND $lakes AS data
      MERGE (n:Lake:Entity {name: data.name, latitude: data.latitude, longitude: data.longitude})
        ON CREATE SET n += data, n.uuid = randomUUID()
        ON MATCH SET n += data
      WITH n AS n0
      UNWIND n0.\`@countries\` AS ref
      MATCH (n1:Country {code: ref})
      MERGE (n0)-[:LOCATED_IN]->(n1)
      REMOVE n0.\`@countries\`
      RETURN
        collect(DISTINCT n0) AS lakes,
        collect(DISTINCT n1) AS countries
    `,
  }).catch(() => status.set(0x3));

  if (status.hasError()) return onExitTask();

  await executeQuery({
    label: 'Create structured metadata',
    params: { datasets },
    statement: cql`
      UNWIND $datasets AS data
      WITH data.\`@dataset\` AS d0,
           data.\`@core\` AS d1,
           data.\`@lake\` AS d2,
           data.\`@category\` AS d3,
           data.\`@publication\` AS d4
      MERGE (n0:Dataset:Entity {file: d0.file})
        ON CREATE SET n0 += d0, n0.uuid = randomUUID()
        ON MATCH SET n0 += d0
      WITH n0, d1, d2, d3, d4
      CALL apoc.cypher.run('
        WITH {d1} AS d1, {d2} AS d2
        MATCH (n2:Lake {name: d2.name})
        WITH d1, d2, n2, CASE
          WHEN d1.latitude IS NOT NULL AND d1.longitude IS NOT NULL = true
          THEN distance(point(n2), point({longitude: d1.longitude, latitude: d1.latitude}))
          WHEN d2.latitude IS NOT NULL AND d2.longitude IS NOT NULL = true
          THEN distance(point(n2), point({longitude: d2.longitude, latitude: d2.latitude}))
          ELSE NULL END AS distance
        ORDER BY distance
        RETURN n2 LIMIT 1',
      {d1: d1, d2: d2}) YIELD value
      WITH n0, d1, value.n2 AS n2, d3, d4
      FOREACH (d1_label IN (CASE d1.label WHEN null THEN [] ELSE [d1.label] END) |
        MERGE (n1_:Core:Entity {label: d1_label})-[:FROM_LAKE]->(n2)
          ON CREATE SET n1_ += d1, n1_.uuid = randomUUID()
          ON MATCH SET n1_ += d1
        MERGE (n0)-[:SAMPLED_FROM]->(n1_)
      )
      FOREACH (d1_ IN (CASE d1.label WHEN null THEN [d1] ELSE [] END) |
        MERGE (n0)-[:SAMPLED_FROM]->(n1_:Core:Entity)
          ON CREATE SET n1_ += d1_, n1_.uuid = randomUUID()
          ON MATCH SET n1_ += d1_
        MERGE (n1_)-[:FROM_LAKE]->(n2)
      )
      WITH n0, n2, d3, d4
      MATCH (n0)-[:SAMPLED_FROM]->(n1:Core)-[:FROM_LAKE]->(n2)
      MERGE (n3:Category:Entity {name: d3.name})
        ON CREATE SET n3.uuid = randomUUID()
      MERGE (n0)-[:BELONGS_TO]->(n3)
      FOREACH (d4_doi IN (CASE d4.doi WHEN null THEN [] ELSE [d4.doi] END) |
        MERGE (n4_:Publication:Entity {doi: d4_doi})
          ON CREATE SET n4_.uuid = randomUUID()
        MERGE (n0)-[:PUBLISHED_IN]->(n4_)
      )
      WITH n0, n1, n2, n3
      OPTIONAL MATCH (n0)-[:PUBLISHED_IN]->(n4)
      RETURN collect(DISTINCT {
        \`@dataset\`:     n0,
        \`@core\`:        n1,
        \`@lake\`:        n2,
        \`@category\`:    n3,
        \`@publication\`: n4
      }) AS datasets
    `,
  }).catch(() => status.set(0x4));

  if (status.hasError()) return onExitTask();

  let recordsCountTotal = 0;

  let importRecordsJobs = datasets.map(({ '@dataset': dataset, '@category': category }) => async () => {
    let attributes, records;
    const file = path.resolve(process.env.SHARED_SHEETS_PATH, dataset['file'] + '.xlsx');
    const sheetName = category['name'] === '14C' ? 'Age' : category['name'];
    console.log('================================================================\n');
    try {
      ({ header: attributes, values: records } = readFromFile({ file, sheetName, headerStart: 'B8' }));
      console.log(`${chalk.green('okay')} --> Found ${chalk.blueBright(String(records.length))} records with ${chalk.blueBright(String(attributes.length))} columns for category \`${chalk.cyan(category['name'])}\` in the file: ${chalk.yellowBright(dataset['file'])}\n`);
    } catch (err) {
      console.log(`${chalk.red('fail')} --> Could not find a sheet named \`${chalk.cyan(category['name'])}\` in the file: ${chalk.yellowBright(dataset['file'])}\n`);
      return;
    }

    records = records.map((record, index) => Object.assign({ rowNum: index + 1 }, record));

    await executeQuery({
      check: false,
      dryRun: false,
      label: 'Import records from file -> ' + dataset['file'],
      params: { dataset, category, attributes, records },
      statement: cql`
        MATCH (n0:Dataset {file: $dataset.file})-[:BELONGS_TO]->(n1:Category {name: $category.name})
        WITH n0, n1
        UNWIND $attributes AS attribute
        MERGE (n2:Attribute:Entity {name: attribute})
          ON CREATE SET n2.uuid = randomUUID()
        MERGE (n0)-[:INCLUDES]->(n2)
        MERGE (n2)-[:BELONGS_TO]->(n1)
        WITH n0, n1, collect(DISTINCT n2) AS attributes
        UNWIND $records AS record
        CREATE (n3:Record)
        SET n3 = record
        MERGE (n3)-[:RECORDED_IN]->(n0)
        RETURN
          n0 AS dataset,
          n1 AS category,
          attributes,
          collect(DISTINCT n3) AS records
    `,
    }).catch(() => status.set(0x4));

    if (!status.hasError()) {
      recordsCountTotal += records.length;
    }
    status.set(0);
  });

  const runJobsSequence = jobs =>
    jobs.reduce((promise, job) => {
      return promise.then(result => job().then(Array.prototype.concat.bind(result)));
    }, Promise.resolve([]));

  await runJobsSequence(importRecordsJobs);

  console.log(`The total number of records is ${chalk.blueBright(String(recordsCountTotal))} now.\n`);

  if (status.hasError()) return onExitTask();

  console.log(chalk.bold.green('All queries have been executed successfully!\n'));

  return onExitTask();
};

function checkFileExists (dataset) {
  let found = false;
  try {
    found = !!fs.statSync(path.resolve(process.env.SHARED_SHEETS_PATH, dataset['file'] + '.xlsx'));
  } catch (err) {
    found = false;
  }
  if (!found) {
    try {
      found = !!fs.statSync(path.resolve(process.env.SHARED_DRAFTS_PATH, dataset['file'] + '.xlsx')) && 'move';
    } catch (err) {
      found = false;
    }
  }
  console.log(`${ found === true ? chalk.green('okay') : found === 'move' ? chalk.yellow('move') : chalk.red('fail') } --> ${ dataset['file'] }`);
  Object.assign(dataset, { '_fileExists': found === true });
}

function checkLakeExists (dataset) {
  if (this.constructor !== Array || !this.length) {
    console.error(new Error('`this` must reference a non-empty array of lakes'));
    dataset['_lakeExists'] = false;
  } else {
    dataset['_lakeExists'] = !!this.find(lake => dataset['@lake.name'] === lake['name']);
  }
}

function addMoreProps (dataset) {
  if (!dataset['_fileExists'] || ( Date.now() - Date.parse(dataset['_lastCheck']) < ms('7 days') )) {
    return;
  }
  const props = Object.assign({}, { ...dataset });
  const workbook = xlsx.readFile(path.resolve(process.env.SHARED_SHEETS_PATH, dataset['file'] + '.xlsx'));
  const metadata = xlsx.utils.sheet_to_json(workbook.Sheets['Metadata'], { header: 'A', range: 'B1:G81' })
    .reduce((accumulator, { B: prop, G: value, __rowNum__: rowNumber }) => {
      prop = typeof prop === 'string' ? prop.trim() : prop;
      value = typeof value === 'string' ? value.trim().replace(/^[-/]$/g, '') : value;
      if (!value || !prop) {
        return accumulator;
      }
      let key = rowNumber < 65 ? 'core' : 'dataset';
      prop = normalize(prop);
      if (mappedProps.hasOwnProperty(prop)) {
        prop = mappedProps[prop];
        if (prop === '@core.drillDate') {
          let match = String(value).match(/\d*$/);
          let number = match ? Number.parseInt(match[0]) : undefined;
          if (number > (new Date()).getFullYear()) {
            number = Math.floor(number / 365 + 1900);
          }
          value = number;
        }
        if (value) {
          accumulator[key][prop] = value;
        }
      }
      return accumulator;
    }, {
      core: {}, dataset: {},
    });
  Object.assign(dataset, metadata.dataset, metadata.core, props, { _lastCheck: new Date() });
}

function sortProperties (dataset) {
  const props = [
    'file',
    'label',
    'analysisMethod',
    'ageMin',
    'ageMax',
    'depthMin',
    'depthMax',
    'samples',
    'ageSpan',
    'ageResolution',
    'comments',
    '@category.name',
    '@publication.doi',
    '@lake.name',
    '@lake.latitude',
    '@lake.longitude',
    '@lake.surfaceLevel',
    '@lake.@countries',
    '@core.label',
    '@core.latitude',
    '@core.longitude',
    '@core.waterDepth',
    '@core.coringMethod',
    '@core.drillDate',
    '@core.composite',
    '_fileExists',
    '_lakeExists',
    '_lastCheck',
  ];
  const propertyOrder = (a, b) => {
    return props.findIndex(k => k === a[0]) - props.findIndex(k => k === b[0]);
  };
  const sortedEntries = Object.entries(dataset).sort(propertyOrder);
  Object.keys(dataset).forEach(key => delete dataset[key]);
  sortedEntries.forEach(([key, value]) => dataset[key] = value);
}

async function executeQuery ({ label, params, statement, dryRun = false, check = true }) {
  let query, results, tx = session.beginTransaction();
  try {
    query = tx.run(statement, params);
    results = (({ records: [r] }) => r && r.toObject())(await query);
    let resultMatchesInput = !check ? true : (Object.entries(query['_parameters']).map(([key, values]) => {
      function compareProperties (x) {
        return Object.keys(this).filter(k => !k.match(/^[@|_]/g)).reduce((valid, p) => {
          return valid && x[p] === this[p];
        }, true);
      };
      if (Array.isArray(values)) {
        return values.reduce((valid, value) => valid && !!results[key].map(x => ({ ...x.properties })).find(compareProperties.bind(value)), true);
      } else if (Object.keys(values)) {
        return !![results[key].properties].find(compareProperties.bind(values));
      }
    }).reduce((total, valid) => valid && total, true));
    if (!resultMatchesInput) { throw new TaskError('Returned objects don\'t match passed input objects'); }
    query.then(r => printQueryStats(label, r));
  } catch(err) {
    await tx.rollback();
    printQueryError(label, err);
    throw false;
  }
  if (dryRun) {
    await tx.rollback();
    return true;
  }
  await tx.commit();
  return true;
}

function cql (cypherQuery) {
  return String(cypherQuery);
}

function printQueryStats (queryLabel, result) {
  let { summary: { counters: { _stats: statistics } } } = result;
  console.log('================================================================\n');
  console.log(`Stats for the query \`${chalk.cyan(queryLabel)}\`:\n`);
  Object.entries(statistics).forEach(([action, count]) => {
     console.log(` => ${changeCase.sentenceCase(action)}: ${count}`);
  });
  console.log('');
}

function printQueryError (queryLabel, err) {
  console.log('================================================================\n');
  console.log(chalk.red(`Failure running the query \`${chalk.cyan(queryLabel)}\`:\n`));
  console.error(chalk.red(err.stack));
  console.log('');
}

function readFromFile ({ file, sheetName, headerStart, valuesStart, endColumn, endRow }) {
  const workbook = xlsx.readFile(file);
  const sheet = workbook.Sheets[sheetName];
  const re = /^[A-Z]{1,3}\d+:([A-Z]{1,3})(\d+)$/g;
  const [, lastColumn, lastRow] = re.exec(sheet['!ref']);
  if (!headerStart) headerStart = 'A1';
  if (!valuesStart) valuesStart = headerStart.charAt(0) + (1 + Number.parseInt(headerStart.charAt(1)));
  if (!endColumn) endColumn = lastColumn;
  if (!endRow) endRow = lastRow;
  const headerRange = util.format(`${headerStart}:%s%s`, endColumn, headerStart.charAt(1));
  const valuesRange = util.format(`${valuesStart}:%s%s`, endColumn, endRow);
  const header = xlsx.utils.sheet_to_json(sheet, { header: 1, range: headerRange })[0].map(normalize);
  const values = xlsx.utils.sheet_to_json(sheet, { header, range: valuesRange });
  return { header, values };
}

function requestUrl (url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on('error', (err) => {
      console.error('Error: ' + err.message);
      reject(err);
    });
  });
}

class TaskError extends Error {
  constructor (message = '') {
    super();
    this.name = 'TaskError';
    this.message = message;
  }
}
