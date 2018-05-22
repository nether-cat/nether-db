'use strict';

const Router = require('koa-router');

const router = new Router({
  prefix: '/api/v1'
});

const factory = function (db) {
  console.log('Initializing routes...');

  Object.entries(db.models).forEach(([name, model]) => {
    router.get(
      name.toLowerCase(),
      '/' + name.toLowerCase(),
      ctx => model.promise
        .query('MATCH (node:' + name + ')')
        .then(results => ctx.body = results),
    );
  });

  router.get(
    'root',
    '/',
    (ctx, next) => {
      ctx.body = 'Hello World';
      return next();
    },
    (ctx, next) => {
      let n = ctx.session.views || 0;
      ctx.session.views = ++n;
      return next();
    },
  );

  return router;
};

module.exports = factory;
