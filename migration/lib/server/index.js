'use strict';

const Koa = require('koa');
const timer = require('./timer');
const logger = require('koa-logger');
const error = require('koa-error');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const session = require('./session');
const router = require('./router');
const { renderer } = require('./renderer');
const database = require('./database');
const config = require('../../config');

require('json-circular-stringify');

Koa.prototype.shutdown = function () {
  console.log('Shutting down the application...');
  database.close();
};

const application = new Koa();

application.context['database'] = database;
application.keys = config.koa.keys;
application
  .use(timer())
  .use(logger())
  .use(error({ engine: 'lodash' }))
  .use(serve(config.app.paths.public))
  .use(bodyParser())
  .use(session.middleware())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(router.controlFlow())
  .use(renderer());

module.exports = { application };
