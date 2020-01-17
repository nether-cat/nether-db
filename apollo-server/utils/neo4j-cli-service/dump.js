const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const JsonRefs = require('json-refs');
const marky = require('marky-markdown');
const graphqlMarkdown = require('graphql-markdown');
const { upperCaseFirst } = require('change-case');
const { default: chalk } = require('chalk');

const { cql, getDbSession, exitHandler, printStats, printError, taskStatus } = require('./lib');

const MAX_INT = Number.MAX_SAFE_INTEGER;

module.exports = async function taskDump ({ host, user, password }) {
  const taskStartTime = Date.now(), root = {};

  if (password) console.log(`Using host ${chalk.underline(host)} with user ${chalk.underline(user)}.\n`);
  else throw new Error('No password has been provided');

  const title = 'VARDA Files Collection',
    name = process.env.npm_package_name,
    version = process.env.npm_package_version,
    credits = `${name} v${version}`;

  const makeAnchor = (url, content) => `<a href="${url}" rel="nofollow" target="_blank">${content || url}</a>`;
  const entry = '<li><a href="#resolve-and-integrate" rel="nofollow">Integration</a></li>';
  const prologue = [
    `*Generated at: ${new Date().toLocaleString('en-ISO', { timeZoneName: 'short' })}*\n`,
    `This collection contains datasets from VARDA v${version} (Varved Sediments Database).`,
    'All bundled JSON files utilize (circular) JSON References for links to related nodes.',
    'We included a code example for resolving all references at the [bottom of this page](#resolve-and-integrate).',
    `Visit ${makeAnchor('https://www.npmjs.com/package/json-refs')} for more information about usage.`,
    `Furthermore you can copy the CSV files from ${makeAnchor('./csv/', 'this directory')} to access the datasets.`,
    `You may also explore VARDA with the web service at ${makeAnchor('https://varve.gfz-potsdam.de')}.`,
  ].join('  \n');
  const epilogue = [
    '## Resolve and integrate',
    'The code example below demonstrates, how the bundled files can be fully resolved',
    `using \`json-refs\`. It is a package for ${makeAnchor('https://nodejs.org/en/about', 'Node.js')}`,
    'and can be installed e.g. with `npm`. You may learn more about `npm`, the package',
    `and JSON References ${makeAnchor('https://www.npmjs.com/package/json-refs', 'here')}.`,
    '### Code example',
    '```js',
    '  const JsonRefs = require(\'json-refs\');',
    '  ',
    '  JsonRefs.resolveRefsAt(\'./index.json\', {',
    '    resolveCirculars: true,',
    '  }).then(function (data) {',
    '    // Do something with the result',
    '    //',
    '    // data.refs: JSON Reference locations and details',
    '    // data.resolved: The document with the appropriate JSON References resolved',
    '    // data.value: The original retrieved document (index.json)',
    '  }).catch(function (err) {',
    '    console.log(err.stack);',
    '  });',
    '```',
  ].join('\n');
  const template = fs.readFileSync(path.resolve('templates', 'index.schema.html'));
  const regexMarkdown = /(<!-- START graphql-markdown -->)[.\s]*(<!-- END graphql-markdown -->)/;
  let schema, documentHTML, documentMD = '', pathExport = createDir(createDir('./live') + '/export');
  schema = await graphqlMarkdown.loadSchemaJSON(path.resolve('apollo-server', 'schema.graphql'));
  let exportedQueryFields = [
    { fieldName: 'categories', actualType: 'Category' },
    { fieldName: 'cores', actualType: 'Core' },
    { fieldName: 'countries', actualType: 'Country' },
    { fieldName: 'datasets', actualType: 'Dataset' },
    { fieldName: 'lakes', actualType: 'Lake' },
    { fieldName: 'publications', actualType: 'Publication' },
  ];
  const excludedObjectFields = [
    'accessLevel',
    'attributes',
    'continents',
    'datasetsCount',
    'initZoom',
    'permissions',
    'protected',
    'resolved',
    'updated',
    'created',
    'types',
    'uuid',
  ];
  const exportedSchemaTypes = exportedQueryFields
    .map(t => t.actualType).concat('Query', 'Entity');
  const makeListField = ({ fieldName, actualType }) => {
    return {
      name: `${fieldName}`,
      description: `List with the [${fieldName}](json/${fieldName}.json) included in this collection.`,
      args: [],
      type: {
        kind: 'LIST',
        name: null,
        ofType: {
          kind: 'OBJECT',
          name: `${actualType}`,
          ofType: null,
        },
      },
      isDeprecated: false,
      deprecationReason: null,
    };
  };
  exportedQueryFields = exportedQueryFields.map(makeListField);
  const schemaTypes = schema.__schema.types;
  const filteredSchemaTypes = schemaTypes.filter(t => {
    return t.kind === 'SCALAR' || exportedSchemaTypes.includes(t.name) || t.name.startsWith('__');
  });
  schemaTypes.splice(0, MAX_INT, ...filteredSchemaTypes);
  const queryType = schemaTypes.find(t => t.name === 'Query');
  queryType.description = 'The collection\'s [root](json/index.json), from which multiple types of *objects* can be explored.';
  queryType.fields.splice(0, MAX_INT, ...exportedQueryFields);
  schemaTypes.forEach(t => t.fields && t.fields.forEach(f => f.args && f.args.splice(0)));
  schemaTypes.forEach(t => t.kind === 'OBJECT' && t.fields && t.fields.splice(0, MAX_INT, ...t.fields.filter(
    f => !excludedObjectFields.includes(f.name),
  )));
  schemaTypes.find(t => t.name === 'Int').description =
    'The `Int` scalar type represents non-fractional signed whole ' +
    'numeric values between -(2<sup>31</sup>) and (2<sup>31</sup>-1).';
  schemaTypes.find(t => t.name === 'String').description =
    'The `String` scalar type represents textual data, represented as UTF-8 character sequences.';
  const entityInterface = schemaTypes.find(t => t.name === 'Entity');
  entityInterface.fields.splice(0, MAX_INT, ...entityInterface.fields.filter(f => f.name !== 'types'));
  entityInterface.fields.forEach(f => {
    let typeRef;
    if (f.type.kind === 'OBJECT' && f.type.name === '_Neo4jDateTime') {
      typeRef = f.type;
    } else if (f.type.kind === 'NON_NULL' && f.type.ofType.name === '_Neo4jDateTime') {
      typeRef = f.type.ofType;
    }
    if (typeRef) {
      f.description += ` (${makeAnchor('https://en.wikipedia.org/wiki/ISO_8601', 'ISO 8601')} representation)`;
      typeRef.kind = 'SCALAR';
      typeRef.name = 'String';
    }
  });
  graphqlMarkdown.renderSchema(schema, { title, prologue, epilogue, printer: line => documentMD += `${line}\n` });
  documentHTML = marky(documentMD, { sanitize: false, prefixHeadingIds: false });
  documentHTML = documentHTML.replace(/Query/g, 'Index').replace(/query/g, 'index');
  documentHTML = documentHTML.replace(/(<\/ul>\n<\/details>\n)/, `${entry}\n$1`);
  documentHTML = `${template}`.replace(regexMarkdown, `$1\n${documentHTML}\n$2`);
  documentHTML = documentHTML.replace(/<%= params.title %>/g, title);
  documentHTML = documentHTML.replace(/<%= params.credits %>/g, credits);
  fs.writeFileSync(path.resolve(pathExport, 'index.html'), documentHTML);

  const db = getDbSession();
  const status = taskStatus();
  const onExitTask = exitHandler(db, status, taskStartTime);

  const objectMappers = {
    lakes: obj => delete obj.initZoom && obj,
    publications: obj => delete obj.resolved && obj,
  };

  Object.assign(root, await readQuery({ db, statement: cql`
    MATCH (lake:Lake)
    WITH DISTINCT lake { .*, created: toString(lake.created), updated: toString(lake.updated),
        \`~countries\`: [(lake)-[:LOCATED_IN]->(lake_countries:Country) | lake_countries { .uuid }],
        \`~cores\`: [(lake)<-[:FROM_LAKE]-(lake_cores:Core) | lake_cores { .uuid }] }
      ORDER BY lake.name ASC
    RETURN collect(DISTINCT lake) AS lakes
  `, label: 'Read all lakes from database' }));

  Object.assign(root, await readQuery({ db, statement: cql`
    MATCH (category:Category)
    WITH DISTINCT category { .*, created: toString(category.created), updated: toString(category.updated),
        \`~datasets\`: [(category)<-[:BELONGS_TO]-(category_datasets:Dataset) | category_datasets { .uuid }] }
      ORDER BY category.name ASC
    RETURN collect(DISTINCT category) AS categories
  `, label: 'Read all categories from database' }));

  Object.assign(root, await readQuery({ db, statement: cql`
    MATCH (country:Country)
    WITH DISTINCT country { .*, created: toString(country.created), updated: toString(country.updated),
        \`~lakes\`: [(country)<-[:LOCATED_IN]-(country_lakes:Lake) | country_lakes { .uuid }] }
      ORDER BY country.name ASC
    RETURN collect(DISTINCT country) AS countries
  `, label: 'Read all countries from database' }));

  Object.assign(root, await readQuery({ db, statement: cql`
    MATCH (lake:Lake)--(core:Core)
    WITH DISTINCT lake, core { .*, created: toString(core.created), updated: toString(core.updated),
        \`~lakes\`: [(core)-[:FROM_LAKE]->(core_lakes:Lake) | core_lakes { .uuid }],
        \`~datasets\`: [(core)<-[:SAMPLED_FROM]-(core_datasets:Dataset) | core_datasets { .uuid }] }
      ORDER BY lake.name ASC
    RETURN collect(DISTINCT core) AS cores
  `, label: 'Read all cores from database' }));

  Object.assign(root, await readQuery({ db, statement: cql`
    MATCH (lake:Lake)--(:Core)--(dataset:Dataset)
    WITH DISTINCT lake, dataset { .*, created: toString(dataset.created), updated: toString(dataset.updated),
        \`~categories\`: [(dataset)-[:BELONGS_TO]->(dataset_categories:Category) | dataset_categories { .uuid }],
        \`~cores\`: [(dataset)-[:SAMPLED_FROM]->(dataset_cores:Core) | dataset_cores { .uuid }],
        \`~publications\`: [(dataset)-[:PUBLISHED_IN]->(dataset_pubs:Publication) | dataset_pubs { .uuid }],
        \`~records\`: { \`$ref\`: 'records/' + dataset.uuid + '.json' } }
      ORDER BY lake.name, dataset.file ASC
    RETURN collect(DISTINCT dataset) AS datasets
  `, label: 'Read all datasets from database' }));

  Object.assign(root, await readQuery({ db, statement: cql`
    MATCH (pub:Publication)
    WITH DISTINCT pub { .*, created: toString(pub.created), updated: toString(pub.updated),
        \`~datasets\`:[(pub)<-[:PUBLISHED_IN]-(pub_datasets:Dataset) | pub_datasets {.uuid}]}
    RETURN collect(DISTINCT pub) AS publications
  `, label: 'Read all publications from database' }));

  Object.entries(root).forEach(([group, arr]) => {
    const transform = (
      typeof objectMappers[group] === 'function'
    ) ? objectMappers[group] : obj => obj;
    arr.forEach(obj => {
      transform(obj);
      Object.entries(obj).filter(([k]) => k.startsWith('~')).forEach(([k, v]) => {
        let linkedGroup = k.substr(1);
        if (Array.isArray(v)) {
          v.forEach(linked => {
            let index = root[linkedGroup].findIndex(({ uuid }) => linked.uuid === uuid);
            if (index < 0) {
              throw new Error(`In \`${linkedGroup}\` the \`uuid\` could not be found: ${linked.uuid}`);
            }
            linked.$ref = `${linkedGroup}.json#/${index}`;
            delete linked.uuid;
          });
        } else {
          obj[k].$ref = `${linkedGroup}/${obj.uuid}.json#`;
        }
        obj[linkedGroup] = obj[k];
        delete obj[k];
      });
      const { created, updated, uuid } = obj;
      const { fields } = schemaTypes.find(
        ({ name }) => name === upperCaseFirst(singularize(group)),
      ) || { fields: [] };
      const props = Object.fromEntries(
        Object.entries(obj)
          .filter(([k]) => !excludedObjectFields.includes(k))
          .sort(([k1], [k2]) => {
            const a = fields.findIndex(({ name }) => name === k1);
            const b = fields.findIndex(({ name }) => name === k2);
            return (a < 0 ? fields.length : a) - (b < 0 ? fields.length : b);
          }),
      );
      Object.keys(obj).forEach(k => delete obj[k]);
      Object.assign(obj, props, { created, updated, uuid });
    });
  });

  Object.assign(root, { 'records': {} });

  const datasetsTotal = Object.keys(root.datasets).length;

  for (let asyncFunc of Object.values(root.datasets).map(({ uuid }) => async () => {
    let { data } = await readQuery({ db: getDbSession(), params: { uuid }, statement: cql`
      MATCH (l0:Lake)--()--(d0:Dataset)--(c0:Category)--(a0:Attribute)-[rel]-(d0)
        WHERE d0.uuid = $uuid
      WITH l0.name AS lake,
           d0.file AS dataset,
           c0.name AS category,
           d0,
           rel,
           a0
        ORDER BY lake, dataset, rel.\`__colNum__\`
      WITH lake,
           dataset,
           d0,
           category,
           a0.name AS key,
           rel.\`__colNum__\` AS column
      MATCH (d0)-[rel]-(r0:Record)
      WITH lake, dataset, d0.uuid AS uuid, category, key, rel, apoc.map.get(r0, '__' + column + '__', "%NULL%") AS value
        ORDER BY lake, dataset, rel.\`__rowNum__\`
      WITH lake, dataset, uuid, category, rel, collect(key) as keys, collect(value) AS values
      RETURN { uuid: uuid, records: collect({ keys: keys, values: values }) } AS data
    `, label: 'Read records from dataset ' + uuid });

    await Promise.all(data.records.map(async ({ keys, values }, i) => {
      data.records[i] = Object.fromEntries(keys.map((k, i) => [k, values[i]]).filter(([, v]) => v !== '%NULL%'));
    }));

    root['records'][data.uuid] = data.records;
  })) {
    await asyncFunc();
    console.log(`Datasets processed: ${Object.keys(root['records']).length} / ${datasetsTotal} (total)\n`);
  }

  root.index = {};
  Object.keys(root)
    .filter(key => key !== 'index' && key !== 'records')
    .forEach(key => root.index[key] = { $ref: `${key}.json#` });

  console.log('================================================================\n');

  const str = p => `./${path.relative(path.resolve('.'), p)}`;
  const log = (p, n) => console.log(`Dumped ${n} ${n === 1 ? 'node' : 'nodes'} to: ${chalk.yellowBright(str(p))}`);
  const write = (file, data, n) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(file, data, err => err ? reject(err) : log(file, n) || resolve(true));
    });
  };
  const dump = (file, data, n = 'some') => createDir(path.dirname(file)) && write(file, data, n);
  const to = {
    csv: createDir(`${pathExport}/csv`),
    json: createDir(`${pathExport}/json`),
  };
  const writeFilesTo = (dir) => {
    return async ([k, v]) => {
      let count = Object.keys(v).length,
        targetJSON = path.resolve(to.json, dir, k + '.json'),
        valuesJSON = JSON.stringify(v);
      try {
        await Promise.all([
          dump(targetJSON, valuesJSON, count),
        ]);
      } catch (e) {
        console.error(chalk.red(e.toString().trim()));
      }
    };
  };

  await Promise.all([
    ...Object.entries(root).filter(([k]) => k !== 'records').map(writeFilesTo('.')),
    ...Object.entries(root['records']).map(writeFilesTo('./records')),
  ]).catch((e) => console.error(chalk.red(e.toString().trim())));

  console.log('\n================================================================\n');

  await JsonRefs.resolveRefsAt(path.resolve(to.json, 'index.json'), {
    resolveCirculars: true,
  }).then(({ resolved: { datasets } }) => {
    const index = datasets.map(dataset => flatTree(['dataset', dataset], {})[1]);
    return Promise.all([
      dump(`${to.csv}/index.csv`, XLSX.utils.sheet_to_csv(
        XLSX.utils.json_to_sheet(index),
      ), index.length),
      ...datasets.map(({ file, records }) => dump(`${to.csv}/records/${file}.csv`, XLSX.utils.sheet_to_csv(
        XLSX.utils.json_to_sheet(records),
      ), records.length)),
    ]);
  }).catch((e) => console.error(chalk.red(e.toString().trim())));

  console.log('\n================================================================\n');

  if (status.hasError()) return onExitTask();

  return onExitTask();
};

function createDir (dir) {
  try { fs.mkdirSync(path.resolve(dir)); } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  return dir;
};

async function readQuery ({ label, db, params, statement }) {
  let query, results, tx = db.beginTransaction();
  try {
    query = tx.run(statement, params);
    results = (({ records: [r] }) => r && r.toObject())(await query);
    await query.then(r => printStats(label, r));
  } catch(err) {
    await tx.rollback();
    printError(label, err);
    throw false;
  }
  await tx.commit();
  return results;
}

function flatTree ([path, obj], target, parent) {
  const key = path;
  if (!obj) {
    return [key, obj];
  } else if (path) {
    path += '.';
  }
  Object.assign(
    target,
    Object.fromEntries(
      Object.entries(obj)
        .filter(([key, value]) => !['created', 'updated'].includes(key) && !Array.isArray(value))
        .map(([key, value]) => [`${path}${key}`, value]),
    ),
  );
  Object.entries(obj)
    .filter(([key, arr]) => Array.isArray(arr) && !arr.includes(parent) && key !== 'records')
    .forEach(([key, arr]) => flatTree([`${path}${singularize(key)}`, arr[0]], target, obj));
  return [key, target];
};

function singularize (str) {
  return str.replace(/ies$/, 'y').replace(/s$/, '');
}
