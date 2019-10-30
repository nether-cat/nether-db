const fs = require('fs');
const path = require('path');
const { default: chalk } = require('chalk');

const { cql, getDbSession, exitHandler, printStats, printError, taskStatus } = require('./lib');

module.exports = async function taskDump ({ host, user, password }) {
  const taskStartTime = Date.now(), root = {};

  if (password) console.log(`Using host ${chalk.underline(host)} with user ${chalk.underline(user)}.\n`);
  else throw new Error('No password has been provided');

  const db = getDbSession();
  const status = taskStatus();
  const onExitTask = exitHandler(db, status, taskStartTime);

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
        \`~datasets\`: [(category)<-[:BELONGS_TO]-(category_datasets:Datasets) | category_datasets { .uuid }] }
      ORDER BY category.name ASC
    RETURN collect(DISTINCT category) AS subjects
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
        \`~subjects\`: [(dataset)-[:BELONGS_TO]->(dataset_subjects:Category) | dataset_subjects { .uuid }],
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
    arr.forEach(obj => {
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
      delete obj.created; delete obj.updated; delete obj.resolved;
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
           c0.name AS subject,
           d0,
           rel,
           a0
        ORDER BY lake, dataset, rel.\`__colNum__\`
      WITH lake,
           dataset,
           d0,
           subject,
           a0.name AS key,
           rel.\`__colNum__\` AS column
      MATCH (d0)-[rel]-(r0:Record)
      WITH lake, dataset, d0.uuid AS uuid, subject, key, rel, apoc.map.get(r0, '__' + column + '__', "%NULL%") AS value
        ORDER BY lake, dataset, rel.\`__rowNum__\`
      WITH lake, dataset, uuid, subject, rel, apoc.map.fromLists(collect(key), collect(value)) AS record
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

  console.log('================================================================\n');

  function writeFileFunc (dir) {
    return async ([key, values]) => {
      let count = Object.keys(values).length, str = `${dir}/${key}.json`;
      fs.writeFileSync(path.resolve(dir, key + '.json'), JSON.stringify(values));
      console.log(`Dumped ${count} ${count !== 1 ? 'nodes' : 'node'} to file: ${chalk.yellowBright(str)}`);
    };
  }
  function createDir (dir) {
    try { fs.mkdirSync(path.resolve(dir)); } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
    return dir;
  };
  let prefixRoot = createDir(createDir('./live') + '/export');
  let prefixRecords = createDir(prefixRoot + '/records');

  await Promise.all([
    ...Object.entries(root).filter(([k]) => k !== 'records').map(writeFileFunc(prefixRoot)),
    ...Object.entries(root['records']).map(writeFileFunc(prefixRecords)),
  ]).then(() => console.log(''));

  if (status.hasError()) return onExitTask();

  /**
   * The example below shows, how you can completely resolve the dumped files using JsonRefs.
   * It is available e.g. with `npm` by the package name `json-refs`. You can read more about
   * `npm`, the package and JSON References [here](https://www.npmjs.com/package/json-refs).
   *
   * ```js
   *
   *   const JsonRefs = require('json-refs');
   *
   *   JsonRefs.resolveRefsAt('./live/export/lakes.json', {
   *     resolveCirculars: true,
   *   }).then(function (res) {
   *     // Do something with the response
   *     //
   *     // res.refs: JSON Reference locations and details
   *     // res.resolved: The document with the appropriate JSON References resolved
   *     // res.value: The actually retrieved document
   *   }).catch(function (err) {
   *     console.log(err.stack);
   *   });
   *
   * ```
   */

  return onExitTask();
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
