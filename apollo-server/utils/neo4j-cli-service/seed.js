const fs = require('fs');
const path = require('path');
const util = require('util');
const https = require('https');
const ms = require('ms');
const xlsx = require('xlsx');
const countriesList = require('countries-list');
const { default: chalk } = require('chalk');
const unorm = require('unorm');

const { cql, getDbSession, exitHandler, normalize, printStats, printError, taskStatus } = require('./lib');

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

const attributeMappers = [
  str => str.replace('uncertainty', 'error'),
  str => str.replace('Uncertainty', 'Error'),
];

const datasetsOrder = (a, b) => {
  return (
    (!a['_fileExists'] - !b['_fileExists']) ||
    (!a['_lakeExists'] - !b['_lakeExists']) ||
    a['@lake.name'].localeCompare(b['@lake.name']) ||
    a['@category.name'].localeCompare(b['@category.name']) ||
    (!!a['file'] && !!b['file'] && a['file'].localeCompare(b['file'])) || 0
  );
};

const filenameFixes = new Map(), filenameRefs = new Map();

let storage = {};

module.exports = async function taskSeed ({ host, user, password, filters }) {
  const taskStartTime = Date.now();

  if (password) console.log(`Using host ${chalk.underline(host)} with user ${chalk.underline(user)}.\n`);
  else throw new Error('No password has been provided');

  const db = getDbSession();
  const status = taskStatus();
  const onExitTask = exitHandler(db, status, taskStartTime);;

  let storageFile = path.resolve(process.env.SHARED_SHEETS_PATH, 'records.json');

  if (fs.statSync(storageFile)) {
    storage = require(storageFile);
  } else {
    storage = {};
  }
  if (filters && filters.length) {
    console.log(`After indexing items will be filtered by: ${filters.map(f => chalk.underline(f)).join(', ')}.\n`);
  }

  /** @type Array */ let continents, countries;
  /** @type Array */ let lakes = require('./seeds/lakes');
  /** @type Array */ let datasets = require('./seeds/datasets');

  console.log('Looking for all referenced dataset files...\n');

  datasets.forEach(filterNullValues);
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
  console.log(`Indexed datasets covering ${chalk.blueBright(String(lakesWithData.length))} lakes.\n`);
  console.log(`The total number of datasets is ${chalk.blueBright(String(datasets.length))} now.\n`);
  console.log(`There are about ${chalk.blueBright('~' + average.toFixed(2))} datasets per lake.\n`);

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
  if (filters && filters.length) {
    datasets = datasets.filter(d => filters.some(f => d['file'].toLowerCase().includes(f.toLowerCase())));
  }
  datasets.forEach(dataset => {
    const structuredObj = Object.entries(dataset).reduce((obj, [key, value]) => {
      let [, ref, prop] = key.match(/^(@\w+)\.(\w+)$/) || [];
      if (ref && prop) {
        if (ref === '@core' && prop === 'drillDate') {
          value = sanitizeDrillDate({ value });
        }
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
    db,
    check: false,
    label: 'Add constraints for unique properties',
    statement: cql`
      CREATE CONSTRAINT ON ( entity:Entity ) ASSERT entity.uuid IS UNIQUE
    `,
  });

  await (() => new Promise(resolve => setTimeout(() => resolve(), 3000)))();

  await executeQuery({
    db,
    label: 'Add continents and countries',
    params: { continents, countries },
    statement: cql`
      UNWIND $continents AS data
      MERGE (n:Continent:Entity {code: data.code})
        ON CREATE SET n += data, n.uuid = randomUUID(), n.updated = datetime(), n.created = n.updated
        ON MATCH SET n.name = data.name, n.updated = datetime()
      WITH n AS n0
      UNWIND $countries AS data
      MERGE (n:Country:Entity {code: data.code})
        ON CREATE SET n.name = data.name, n.uuid = randomUUID(), n.updated = datetime(), n.created = n.updated
        ON MATCH SET n.name = data.name, n.updated = datetime()
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
    db,
    label: 'Add all known lakes',
    params: { lakes },
    statement: cql`
      UNWIND $lakes AS data
      MERGE (n:Lake:Entity {name: data.name, latitude: data.latitude, longitude: data.longitude})
        ON CREATE SET n += data {.*, \`@countries\`: null}, n.uuid = randomUUID(), n.updated = datetime(), n.created = n.updated
        ON MATCH SET n += data {.*, \`@countries\`: null}, n.updated = datetime()
      WITH n as n0, data
      UNWIND data.\`@countries\` as ref
      MATCH (n1:Country {code: ref})
      MERGE (n0)-[:LOCATED_IN]->(n1)
      RETURN
        collect(DISTINCT n0) AS lakes,
        collect(DISTINCT n1) AS countries
    `,
  }).catch(() => status.set(0x3));

  if (status.hasError()) return onExitTask();

  await executeQuery({
    db,
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
        ON CREATE SET n0 += d0, n0.uuid = randomUUID(), n0.updated = datetime(), n0.created = n0.updated
        ON MATCH SET n0 += d0, n0.updated = datetime()
      WITH n0, d1, d2, d3, d4
      OPTIONAL MATCH (n0)-[r0_:PUBLISHED_IN]-(:Publication)
      DELETE r0_
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
          ON CREATE SET n1_ += d1, n1_.uuid = randomUUID(), n1_.updated = datetime(), n1_.created = n1_.updated
          ON MATCH SET n1_ += d1, n1_.updated = datetime()
        MERGE (n0)-[:SAMPLED_FROM]->(n1_)
      )
      FOREACH (d1_ IN (CASE d1.label WHEN null THEN [d1] ELSE [] END) |
        MERGE (n0)-[:SAMPLED_FROM]->(n1_:Core:Entity)
          ON CREATE SET n1_ += d1_, n1_.uuid = randomUUID(), n1_.updated = datetime(), n1_.created = n1_.updated
          ON MATCH SET n1_ += d1_, n1_.updated = datetime()
        MERGE (n1_)-[:FROM_LAKE]->(n2)
      )
      WITH n0, n2, d3, d4
      MATCH (n0)-[:SAMPLED_FROM]->(n1:Core)-[:FROM_LAKE]->(n2)
      MERGE (n3:Category:Entity {name: d3.name})
        ON CREATE SET n3.uuid = randomUUID(), n3.updated = datetime(), n3.created = n3.updated
      MERGE (n0)-[:BELONGS_TO]->(n3)
      FOREACH (d4_doi IN (CASE d4.doi WHEN null THEN [] ELSE [d4.doi] END) |
        MERGE (n4_:Publication:Entity {doi: d4_doi})
          ON CREATE SET n4_.uuid = randomUUID(), n4_.updated = datetime(), n4_.created = n4_.updated
          ON MATCH SET n4_.updated = datetime()
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
    const file = filenameRefs.has(dataset['file'])
      ? filenameRefs.get(dataset['file'])
      : path.resolve(
        process.env.SHARED_SHEETS_PATH,
        filenameFixes.has(dataset['file'])
          ? filenameFixes.get(dataset['file'])
          : (dataset['file'] + '.xlsx'),
    );
    const sheetName = category['name'] === '14C' ? 'Age' : category['name'];
    console.log('================================================================\n');
    try {
      if ('string' === typeof file) {
        ({ header: attributes, values: records } = readFromFile({ file, sheetName, headerStart: 'B8' }));
        attributes = attributes.filter(attribute => records.some(record => record.hasOwnProperty(attribute)));
      } else {
        ({ header: attributes, values: records } = readFromStorage({ file, sheetName }));
      }
      console.log(`${chalk.green('okay')} --> Found ${chalk.blueBright(String(records.length))} records `
        + `with ${chalk.blueBright(String(attributes.length))} columns for `
        + `category \`${chalk.cyan(category['name'])}\` in the file: ${chalk.yellowBright(dataset['file'])}\n`);
    } catch (err) {
      console.log(`${chalk.red('fail')} --> Could not find a sheet named \`${chalk.cyan(category['name'])}\` `
        + `in the file: ${chalk.yellowBright(dataset['file'])}\n`);
      return;
    }

    records = records.map(record => Object.fromEntries(Object.entries(record).map(
      ([key, value]) => [`__${attributes.findIndex(attribute => attribute === key)}__`, value],
    )));
    attributes = attributes.map(str => attributeMappers.reduce((value, map) => map(value), str));

    await executeQuery({
      db,
      check: false,
      dryRun: false,
      label: 'Import records from file -> ' + dataset['file'],
      params: { dataset, category, attributes, records },
      statement: cql`
        MATCH (n0:Dataset {file: $dataset.file})-[:BELONGS_TO]->(n1:Category {name: $category.name})
        WITH n0, n1, range(0, size($attributes) - 1) AS indices
        UNWIND indices AS column
        MERGE (n2:Attribute:Entity {name: $attributes[column]})
          ON CREATE SET n2.uuid = randomUUID(), n2.updated = datetime(), n2.created = n2.updated
          ON MATCH SET n2.updated = datetime()
        MERGE (n0)-[r0:INCLUDES]->(n2)
        SET r0.__colNum__ = column
        // TODO: We need more props on these edges, e.g. unit and method
        MERGE (n2)-[:BELONGS_TO]->(n1)
        WITH n0, n1, collect(DISTINCT n2) AS attributes
        OPTIONAL MATCH (_n0:Record)-[_r0:RECORDED_IN]->(n0)
        OPTIONAL MATCH (_n0)-[_r1:CORRELATES]->(_n1:Event)
        DETACH DELETE _n0, _r0, _n1, _r1
        WITH DISTINCT n0, n1, attributes, range(0, size($records) - 1) AS indices
        UNWIND indices AS row
        CREATE (n3:Record)
        SET n3 = $records[row]
        MERGE (n3)-[r1:RECORDED_IN]->(n0)
        SET r1.__rowNum__ = row
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

  await executeQuery({
    db,
    check: false,
    label: 'Create all events',
    statement: cql`
      MATCH (n0:Category { name: 'Tephra' })--(n1:Attribute)<-[r1:INCLUDES]-(n2:Dataset)--(n0),
          (n2)--(s:Core)--(l:Lake)--(c:Country)--(ct:Continent)
      WHERE n1.name IN ['age', 'correlatedToEvent', 'datedInCore', 'ageTransferReference']
      WITH c, l, s, n2 as ds, apoc.map.fromPairs(
      collect([n1.name, '__' + r1.__colNum__ + '__'])
      ) as props, [(n2)--(r:Record) | r] as records
      UNWIND records as record
      WITH c, l, s, ds, record, {
        age: apoc.map.get(record, props.age, null, false),
        correlatedToEvent: apoc.map.get(record, props.correlatedToEvent, null, false)
      } as data
      WHERE data.age IS NOT NULL AND data.correlatedToEvent IS NOT NULL
      MERGE (evt:Event:Entity {name: data.correlatedToEvent})
        ON CREATE SET evt.uuid = randomUUID(), evt.updated = datetime(), evt.created = evt.updated
        ON MATCH SET evt.updated = datetime()
      MERGE (record)-[link:CORRELATES { age: data.age }]->(evt)
      WITH c, l, s, ds, record, evt
      MATCH (evt)-[links]-()
      WITH c, l, s, ds, record, evt, count(links) as priority
      WHERE priority > 1
      RETURN c, l, s, ds, record, evt
    `,
  }).catch(() => status.set(0x4));

  if (status.hasError()) return onExitTask();

  console.log(chalk.bold.green('All queries have been executed successfully!\n'));

  return onExitTask();
};

function filterNullValues (dataset) {
  Object.keys(dataset).forEach(key => dataset[key] === null && delete dataset[key]);
}

function checkFileExists (dataset) {
  let state = { storage: false, folder: 0, needsFix: false };
  let checkWith = (filename => {
    try {
      state.folder = !!fs.statSync(path.resolve(process.env.SHARED_SHEETS_PATH, filename)) && 1;
      if (state.folder && state.needsFix) {
        filenameFixes.has(dataset.file) || filenameFixes.set(dataset.file, filename);
      }
    } catch (err) {
      state.folder = 0;
    }
    if (!state.folder) {
      try {
        state.folder= !!fs.statSync(path.resolve(process.env.SHARED_DRAFTS_PATH, filename)) && 2;
      } catch (err) {
        state.folder = 0;
        state.needsFix = true;
      }
    }
    return state.folder;
  });
  let testStorage = (() => {
    if (Array.isArray(storage[dataset.file]) && storage[dataset.file].length) {
      state.storage = true;
      filenameRefs.has(dataset.file) || filenameRefs.set(dataset.file, storage[dataset.file]);
    }
    return state.storage;
  });
  testStorage() || checkWith(dataset.file + '.xlsx') || checkWith(unorm.nfc(dataset.file) + '.xlsx');
  console.log(`${ state.storage
    ? chalk.green('json')
    : state.folder === 1
      ? chalk.green('okay')
      : state.folder === 2
        ? chalk.yellow('warn')
        : chalk.red('fail')
  } --> ${ dataset['file'] }`);
  Object.assign(dataset, {
    '_json': !!state.storage,
    '_fileExists': state.folder === 1 || state.storage,
    '_fileWarn': state.folder === 1 && state.needsFix,
  });
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
  if (dataset['_json'] || !dataset['_fileExists'] || (Date.now() - Date.parse(dataset['_lastCheck']) < ms('7 days'))) {
    return;
  }
  const props = Object.assign({}, { ...dataset });
  const workbook = xlsx.readFile(
    path.resolve(
      process.env.SHARED_SHEETS_PATH,
      filenameFixes.has(dataset['file'])
        ? filenameFixes.get(dataset['file'])
        : (dataset['file'] + '.xlsx'),
    ),
  );
  const metadata = xlsx.utils.sheet_to_json(workbook.Sheets['Metadata'], { header: 'A', range: 'B1:G81' })
    .reduce((accumulator, { B: prop, G: value, __rowNum__ }) => {
      prop = typeof prop === 'string' ? prop.trim() : prop;
      value = typeof value === 'string' ? value.trim().replace(/^[-/]$/g, '') : value;
      if (!value || !prop) {
        return accumulator;
      }
      let key = __rowNum__ < 65 ? 'core' : 'dataset';
      prop = normalize(prop);
      if (mappedProps.hasOwnProperty(prop)) {
        prop = mappedProps[prop];
        if (prop === '@core.drillDate') {
          value = sanitizeDrillDate({ value, fixExcelOnly: true });
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

function sanitizeDrillDate ({ value, fixExcelOnly = false }) {
  let match = String(value).match(/\d*$/);
  let result = match ? Number.parseInt(match[0]) : undefined;
  if (result > (new Date()).getFullYear()) {
    result = Math.floor(result / 365 + 1900);
  } else if (fixExcelOnly) {
    result = value;
  }
  return result;
}

function sortProperties (dataset) {
  const props = [
    'file',
    'label',
    'samples',
    'ageMin',
    'ageMax',
    'depthMin',
    'depthMax',
    'ageSpan',
    'ageResolution',
    'depthSpan',
    'depthResolution',
    'analysisMethod',
    'comments',
    'url',
    'distributor',
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
    '_json',
    '_file',
    '_fileWarn',
    '_fileExists',
    '_lakeExists',
    '_lastCheck',
  ];
  const propertyOrder = (a, b) => {
    let left = props.findIndex(k => k === a[0]);
    let right = props.findIndex(k => k === b[0]);
    return (left === -1 ? props.length : left) - (right === -1 ? props.length : right);
  };
  const sortedEntries = Object.entries(dataset).sort(propertyOrder);
  Object.keys(dataset).forEach(key => delete dataset[key]);
  sortedEntries.forEach(([key, value]) => dataset[key] = value);
}

async function executeQuery ({ label, db, params, statement, check = true, dryRun = false }) {
  let query, results, tx = db.beginTransaction();
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
        return values.reduce((valid, value) => valid && (
          !!results[key]
            .map(x => ({ ...x.properties }))
            .find(compareProperties.bind(value))
        ), true);
      } else if (Object.keys(values)) {
        return !![results[key].properties].find(compareProperties.bind(values));
      }
    }).reduce((total, valid) => valid && total, true));
    if (!resultMatchesInput) {
      throw new Error('Returned objects don\'t match passed input objects');
    }
    await query.then(r => printStats(label, r));
  } catch(err) {
    await tx.rollback();
    printError(label, err);
    throw false;
  }
  if (dryRun) {
    await tx.rollback();
    return true;
  }
  await tx.commit();
  return true;
}

function readFromStorage ({ file: records }) {
  let header = Object.keys(records.reduce((propModel, record) => propModel = { ...propModel, ...record }, {}));
  return { header, values: [...records] };
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
  const rowsWithRawValues = xlsx.utils.sheet_to_json(sheet, { header, range: valuesRange, raw: true });
  const rows = xlsx.utils.sheet_to_json(sheet, { header, range: valuesRange, raw: false });
  const values = rowsWithRawValues.map((row, index) => Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, typeof v === 'number' ? Number.parseFloat(rows[index][k]) : v]),
  ));
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
