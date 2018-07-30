'use strict';

const Router = require('koa-router');

const proxy = require('./proxy');
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
  .use('/user', user.routes());

module.exports = router;
