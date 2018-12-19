'use strict';

const Router = require('koa-router');

const router = new Router();

router.get('proxy/index', '/', async ctx => {
  /** @type Session */ let session = ctx.database.session();
  let result = await session.run(
    `
    MATCH (n0:Proxy)--(:Attribute)--(:Collection)--(n0)
    RETURN DISTINCT n0 as proxy
    `,
  );
  ctx.body = {
    success: true,
    proxies: result.records.map(row => {
      let proxy = row.get('proxy');
      return { id: proxy.identity, ...proxy.properties };
    }),
  };
  session.close();
});

router.get('proxy/:id', '/:id', async ctx => {
  /** @type Session */ let session = ctx.database.session();
  let result = await session.run(
    `
    MATCH (n0:Proxy)--(n1:Attribute)--(:Collection)--(n0)
    WHERE id(n0) = $id
    RETURN DISTINCT n0 as proxy, COLLECT(DISTINCT n1) as attributes
    `,
    { id: Number.parseInt(ctx.params.id) },
  );
  ctx.body = {
    success: true,
    proxy: result.records.map(row => {
      let proxy = row.get('proxy');
      let _attributes = row.get('attributes').map(attribute => {
        return { id: attribute.identity, ...attribute.properties };
      });
      return { id: proxy.identity, ...proxy.properties, _attributes };
    }).pop(),
  };
  session.close();
});

module.exports = router;
