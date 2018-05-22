'use strict';

const Koa = require('koa');
const logger = require('koa-logger');
const serve = require('koa-static');
const session = require('koa-session');

const config = require('../../config');
const db = require('../../models');
const api = require('./api-router')(db);

const app = new Koa();

const timer = function () {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  };
};

app.context['db'] = db;
app.keys = config['koa']['keys'];
app.use(session(app));
app.use(timer());
app.use(logger());
app.use(serve(config['app']['public']));
app.use(api.routes());
app.use(api.allowedMethods());

module.exports = app;
