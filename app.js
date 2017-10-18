'use strict';

const Koa = require('koa');
const logger = require('koa-logger');
const serve = require('koa-static');
const route = require('koa-route');
const repl = require('repl');
const db = require('./models');
const app = new Koa();
const timer = function () {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  };
};

db.sequelize
  .sync({force: true})
  .then(() => {
    repl.start('REPL> \n').context['db'] = db;
  });
app.context['db'] = db;
app.use(timer());
app.use(logger());
app.use(serve(__dirname + '/public'));
app.use(route.get('/hello', ctx => {
  ctx.body = 'Hello World';
}));

module.exports = app;
