'use strict';

const Router = require('koa-router');

const database = require('../database');
const auth = require('./auth');

const router = new Router({
  prefix: '/v1',
});

router
  .use('/auth', auth.routes())
  .get('index', '/', async ctx => ctx.body = { message: 'Hello World!' });

Object.entries(database.models).forEach(([name, model]) => {
  router.get(name.toLowerCase(), '/' + name.toLowerCase(), async ctx => (
    await model.promise.query('MATCH (node:' + name + ')')
      .then(results => ctx.body = results)
  ));
});

module.exports = router;
