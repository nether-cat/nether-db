const fs = require('fs');
const path = require('path');
const marky = require('marky-markdown');
const graphqlMarkdown = require('graphql-markdown');
const { default: chalk } = require('chalk');

const { cql, getDbSession, exitHandler, printStats, printError, taskStatus } = require('./lib');

const MAX_INT = Number.MAX_SAFE_INTEGER;

module.exports = async function taskDump ({ host, user, password }) {
  const taskStartTime = Date.now(), root = {};

  if (password) console.log(`Using host ${chalk.underline(host)} with user ${chalk.underline(user)}.\n`);
  else throw new Error('No password has been provided');

  let makeAnchor = (url, content) => `<a href="${url}" target="_blank">${content || url}</a>`;
  let title = 'VARDA Files Collection';
  let name = process.env.npm_package_name;
  let version = process.env.npm_package_version;
  let credits = `${name} v${version}`;
  let prologue = [
    `*Generated at: ${new Date().toLocaleString('en-ISO', { timeZoneName: 'short' })}*\n`,
    `This collection contains datasets from VARDA v${version} (Varved Sediments Database).`,
    'Every bundled file/object utilizes (circular) JSON References to link related nodes.',
    'We included a code example for resolving all references at the [bottom of this page](#resolve-and-integrate).',
    `Visit ${makeAnchor('https://www.npmjs.com/package/json-refs')} for more information about usage.`,
    `You may also explore VARDA with the web service at ${makeAnchor('https://varve.gfz-potsdam.de')}.`,
  ].join('  \n');
  let epilogue = [
    '## Resolve and integrate',
    'The code example below demonstrates, how the bundled files can be fully resolved',
    `using \`json-refs\`. It is a package for ${makeAnchor('https://nodejs.org/en/about', 'Node.js')}`,
    'and can be installed e.g. with `npm`. You may learn more about `npm`, the package',
    `and JSON References ${makeAnchor('https://www.npmjs.com/package/json-refs', 'here')}.`,
    '### Code example',
    '```js',
    '  var JsonRefs = require("json-refs");',
    '  ',
    '  JsonRefs.resolveRefsAt("./index.json", {',
    '    resolveCirculars: true,',
    '  }).then(function (res) {',
    '    // Do something with the response',
    '    //',
    '    // res.refs: JSON Reference locations and details',
    '    // res.resolved: The document with the appropriate JSON References resolved',
    '    // res.value: The actually retrieved document',
    '  }).catch(function (err) {',
    '    console.log(err.stack);',
    '  });',
    '```',
  ].join('\n');
  let template = fs.readFileSync(path.resolve('templates', 'index.schema.html'));
  let regexMarkdown = /(<!-- START graphql-markdown -->)[.\s]*(<!-- END graphql-markdown -->)/;
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
  let excludedObjectFields = [
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
  let exportedSchemaTypes = exportedQueryFields
    .map(t => t.actualType).concat('Query', 'Entity');
  let makeListField = ({ fieldName, actualType }) => {
    return {
      name: `${fieldName}`,
      description: `List with the [${fieldName}](${fieldName}.json) included in this collection.`,
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
  let schemaTypes = schema.__schema.types;
  let filteredSchemaTypes = schemaTypes.filter(t => {
    return t.kind === 'SCALAR' || exportedSchemaTypes.includes(t.name) || t.name.startsWith('__');
  });
  schemaTypes.splice(0, MAX_INT, ...filteredSchemaTypes);
  let queryType = schemaTypes.find(t => t.name === 'Query');
  queryType.description = 'The collection\'s [root](index.json), from which multiple types of *objects* can be explored.';
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
  let entityInterface = schemaTypes.find(t => t.name === 'Entity');
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
      let created = obj.created, updated = obj.updated;
      delete obj.created; delete obj.updated;
      Object.assign(obj, { created, updated });
    });
  });

  Object.assign(root, { 'records': {} });

  const datasetsTotal = Object.keys(root.datasets).length;

  for (let asyncFunc of Object.values(root.datasets).map(({ uuid }) => async () => {
    let { records } = await readQuery({ db: getDbSession(), params: { uuid }, statement: cql`
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
      WITH lake, dataset, uuid, category, rel, apoc.map.fromLists(collect(key), collect(value)) AS record
      RETURN { uuid: uuid, data: collect(record) } AS records
    `, label: 'Read records from dataset ' + uuid });

    await Promise.all(records.data.map(async obj => {
      Object.entries(obj).forEach(([key, value]) => {
        if (value === '%NULL%') {
          delete obj[key];
        }
      });
    }));

    root['records'][uuid] = records.data;
  })) {
    await asyncFunc();
    console.log(`Datasets processed: ${Object.keys(root['records']).length} / ${datasetsTotal} (total)\n`);
  }

  root.index = {};
  Object.keys(root)
    .filter(key => key !== 'index' && key !== 'records')
    .forEach(key => root.index[key] = { $ref: `${key}.json#` });

  console.log('================================================================\n');

  function writeFileFunc (dir) {
    return async ([key, values]) => {
      let count = Object.keys(values).length, str = `${dir}/${key}.json`;
      fs.writeFileSync(path.resolve(dir, key + '.json'), JSON.stringify(values));
      console.log(`Dumped ${count} ${count !== 1 ? 'nodes' : 'node'} to file: ${chalk.yellowBright(str)}`);
    };
  }
  let pathRecords = createDir(pathExport + '/records');

  await Promise.all([
    ...Object.entries(root).filter(([k]) => k !== 'records').map(writeFileFunc(pathExport)),
    ...Object.entries(root['records']).map(writeFileFunc(pathRecords)),
  ]).then(() => console.log(''));

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
