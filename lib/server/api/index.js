'use strict';

const Router = require('koa-router');

const user = require('./user');

const { User } = require('../../common/store/models/user');

const router = new Router({
  prefix: '/v1',
});

router
  .use('/user', user.routes())
  .get('index', '/', async ctx => ctx.body = { message: 'Hello World!' })
  .get('attribute', '/attribute/:name', async ctx => {
    /** @type Session */ let session = ctx.database.session();
    let result = await session.run(
      'MATCH (n:Attribute { name: {name} }) RETURN n',
      { name: ctx.params.name },
    );
    ctx.body = result.records.map(r => r.get('n'));
    session.close();
  });

module.exports = router;
