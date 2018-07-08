'use strict';

const path = require('path');
const { createBundleRenderer } = require('vue-server-renderer');
const applicationName = require('../../config').app.name;
const cookieName = require('../../config').koa.jwt.cookie;
const rendererVersion = require('vue-server-renderer/package').version;
const template = require('fs').readFileSync(__dirname + '/template.html', 'utf-8');
const serverBundle = require('../../dist/vue-ssr-server-bundle');
const clientManifest = require('../../dist/vue-ssr-client-manifest');

let bundleRenderer = createBundleRenderer(serverBundle, {
  runInNewContext: 'once',
  template,
  clientManifest,
  basedir: path.resolve(__dirname, '../../dist'),
});

const renderer = function () {
  return async ctx => {
    let renderContext = {
      url: ctx.url,
      status: ctx.status,
      title: applicationName,
      token: ctx.state.jwt ? ctx.state.jwt.token : undefined,
      version: rendererVersion,
      tokenChanged: false,
      setToken: function (t) {
        this.tokenChanged = true;
        this.token = t;
      },
      cookieName,
    };
    await bundleRenderer.renderToString(renderContext)
      .then(body => {
        ctx.body = body;
        ctx.status = renderContext.status;
        if (renderContext.tokenChanged) {
          if (renderContext.token) {
            ctx.cookies.set(cookieName, renderContext.token);
          } else {
            ctx.cookies.set(cookieName);
          }
        }
      })
      .catch(err => {
        console.error(err);
        ctx.throw(renderContext.status);
      });
  }
};

const reload = function (serverBundle, clientManifest) {
  let options = { runInNewContext: 'once', template, clientManifest, basedir: path.resolve(__dirname, '../../dist') };
  bundleRenderer = createBundleRenderer(serverBundle, options);
};

module.exports = { renderer, reload };
