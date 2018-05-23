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

const { createBundleRenderer } = require('vue-server-renderer');
const template = require('fs').readFileSync(__dirname + '/template.txt', 'utf-8');
const serverBundle = require('../../dist/vue-ssr-server-bundle.json');
const clientManifest = require('../../public/vue-ssr-client-manifest.json');
const bundleRenderer = createBundleRenderer(serverBundle, {
  runInNewContext: 'once',
  template,
  clientManifest,
});

const renderer = function () {
  return async (ctx, next) => {
    let renderContext = {
      url: ctx.url,
      status: 200,
    };
    await bundleRenderer.renderToString(renderContext)
      .then(body => {
        ctx.body = body;
        ctx.status = renderContext.status;
      })
      .catch(err => {
        console.error(err)
      });
  }
};

app.context['db'] = db;
app.keys = config['koa']['keys'];
app.use(session(app));
app.use(timer());
app.use(logger());
app.use(serve(config['app']['public']));
app.use(api.routes());
app.use(api.allowedMethods());
app.use(renderer());

module.exports = app;
