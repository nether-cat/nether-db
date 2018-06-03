'use strict';

const Router = require('koa-router');
const session = require('../session');

const users = [
  {
    'login_name': 'tester1',
    'email': 'tester1@example.com',
    'password': 'foo',
  },
  {
    'login_name': 'tester2',
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
    matchedName = (user.login_name === queryName || user.email === queryName);
    matchedPassword = (user.password === queryPassword);
    return matchedName && matchedPassword;
  });
  if (user) {
    let payload = { sub: user.email };
    session.initialize(ctx, payload);
    ctx.body = { success: true };
  } else {
    ctx.body = { success: false };
  }
});

module.exports = router;
