'use strict';

const Router = require('koa-router');

const proxy = require('./proxy');
const search = require('./search');
const user = require('./user');

const router = new Router({
  prefix: '/v1',
});

const index = async ctx => {
  ctx.body = { success: true, message: 'PaLim API Index' };
};

router
  .get('index', '/', index)
  .use('/proxy', proxy.routes())
  .use('/search', search.routes())
  .use('/user', user.routes());

module.exports = router;
