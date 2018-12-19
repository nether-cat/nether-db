'use strict';

const Router = require('koa-router');

const router = new Router();

router.get('search/index', '/', async ctx => {
  /** @type Session */ let session = ctx.database.session();
  let queryResult = await session.run(
    `
    MATCH (n0:Proxy)-[r0]-(n1:Collection)--(f0:Attribute)--(n0),
      (n1)-[r1]-(n2:Core)-[r2]-(n3:Lake)-[r3]-(n4:Country)-[r4]-(n5:Continent)
    WHERE (n0.name IN $proxies OR size($proxies) = 0 OR $proxies IS NULL)
      AND (f0.name IN $attributes OR size($attributes) = 0 OR $attributes IS NULL)
      AND (n4.code IN $countries OR size($countries) = 0 OR $countries IS NULL)
      AND (n5.code IN $continents OR size($continents) = 0 OR $continents IS NULL)
    MATCH (n0)--(n1)-[r5]-(n6:Attribute)-[r6]-(n0)
    OPTIONAL MATCH (n7:Publication)-[r7]-(n1)
    WITH n0, n1, n2, n3, n4, n5, n6, n7, r0, r1, r2, r3, r4, r5, r6, r7
    RETURN collect(DISTINCT n0) AS proxies,
      collect(DISTINCT n1) AS collections,
      collect(DISTINCT n2) AS cores,
      collect(DISTINCT n3) AS lakes,
      collect(DISTINCT n4) AS countries,
      collect(DISTINCT n5) AS continents,
      collect(DISTINCT n6) AS attributes,
      collect(DISTINCT n7) AS publications,
      collect(DISTINCT r0) AS collection_proxy_rels,
      collect(DISTINCT r1) AS collection_core_rels,
      collect(DISTINCT r2) AS core_lake_rels,
      collect(DISTINCT r3) AS lake_country_rels,
      collect(DISTINCT r4) AS country_continent_rels,
      collect(DISTINCT r5) AS collection_attribute_rels,
      collect(DISTINCT r6) AS attribute_proxy_rels,
      collect(DISTINCT r7) AS collection_publication_rels
    `,
    { proxies: [], attributes: [], countries: [], continents: [] },
  );
  let results = queryResult.records.shift();
  let isRecord = results.constructor.name === "Record";
  ctx.body = {
    success: isRecord,
    results: isRecord ? results.toObject() : null,
  };
  session.close();
});

router.get('search/collection/:id', '/collection/:id', async ctx => {
  /** @type Session */ let session = ctx.database.session();
  let queryResult = await session.run(
    `
    MATCH (n0:Collection)-[r0]-(n1:Record) WHERE id(n0) = toInteger($id) RETURN n1 AS record
    `,
    { id: Number(ctx.params.id) },
  );
  let results = queryResult.records.map(row => {
    let record = row.get('record');
    return { id: record.identity, ...record.properties };
  });
  ctx.body = {
    success: !!results.length,
    records: !!results.length ? results : null,
  };
  session.close();
});

module.exports = router;
