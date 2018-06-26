'use strict';

const Router = require('koa-router');
const session = require('../session');

const users = [
  {
    'loginName': 'tester1',
    'email': 'tester1@example.com',
    'password': 'foo',
  },
  {
    'loginName': 'tester2',
    'email': 'tester2@example.com',
    'password': 'bar',
  },
];

const router = new Router();

router.post('login', '/login', async ctx => {
  let matchedName, matchedPassword,
    queryName = ctx.request.body.name,
    queryPassword = ctx.request.body.password;
  let user = users.find(user => {
    matchedName = (user.loginName === queryName || user.email === queryName);
    matchedPassword = (user.password === queryPassword);
    return matchedName && matchedPassword;
  });
  if (user) {
    let payload = { sub: user.email };
    session.initialize(ctx, payload);
    ctx.body = {
      success: true,
      user: Object.entries(user)
        .filter(([key]) => !['password'].includes(key))
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
    };
  } else {
    ctx.body = { success: false };
    ctx.status = 403;
  }
});

router.get('logout', '/logout', async ctx => {
  if (ctx.state.jwt) {
    ctx.body = { success: true };
  } else {
    ctx.body = { success: false };
    ctx.status = 401;
  }
  session.terminate(ctx);
});

router.get('status', '/status', async ctx => {
  if (ctx.state.jwt) {
    let user = users.find(user => user.email === ctx.state.jwt.payload.sub);
    if (user) {
      ctx.body = {
        success: true,
        user: Object.entries(user)
          .filter(([key]) => !['password'].includes(key))
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
      };
      return;
    } else {
      session.terminate(ctx);
      ctx.status = 401;
    }
  }
  ctx.body = { success: false };
});

module.exports = router;
