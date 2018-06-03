'use strict';

const { createBundleRenderer } = require('vue-server-renderer');
const applicationName = require('../../config').app.name;
const rendererVersion = require('vue-server-renderer/package').version;
const template = require('fs').readFileSync(__dirname + '/template.html', 'utf-8');
const serverBundle = require('../../dist/bundle-server/vue-ssr-server-bundle');
const clientManifest = require('../../dist/bundle-client/vue-ssr-client-manifest');
const bundleRenderer = createBundleRenderer(serverBundle, {
  runInNewContext: 'once',
  template,
  clientManifest,
});

const renderer = function () {
  return async ctx => {
    let renderContext = {
      url: ctx.url,
      status: ctx.status,
      title: applicationName,
      version: rendererVersion,
    };
    await bundleRenderer.renderToString(renderContext)
      .then(body => {
        ctx.body = body;
        ctx.status = renderContext.status;
      })
      .catch(err => {
        console.error(err);
        ctx.throw(renderContext.status);
      });
  }
};

module.exports = renderer;
