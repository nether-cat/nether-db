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
      status: 500,
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
        updateToken(ctx, renderContext);
      })
      .catch(exception => {
        if (!needsRedirect(ctx, renderContext, exception)) {
          ctx.throw(exception);
        }
      });
  }
};

const reload = function (serverBundle, clientManifest) {
  let options = { runInNewContext: 'once', template, clientManifest, basedir: path.resolve(__dirname, '../../dist') };
  bundleRenderer = createBundleRenderer(serverBundle, options);
};

const updateToken = function (ctx, renderContext) {
  if (renderContext.tokenChanged) {
    if (renderContext.token) {
      ctx.cookies.set(cookieName, renderContext.token);
    } else {
      ctx.cookies.set(cookieName);
    }
  }
};

const needsRedirect = function (ctx, renderContext, exception) {
  let location;
  if (exception && ({ needsRedirect: location } = exception)) {
    updateToken(ctx, renderContext);
    ctx.redirect(location);
    ctx.status = 303;
    return true;
  }
};

module.exports = { renderer, reload };
