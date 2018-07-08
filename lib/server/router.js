'use strict';

const isProd = process.env.NODE_ENV === 'production';

const Router = require('koa-router');
const router = new Router();

const mounts = [
  ['/api', require('./api')],
];

if (!isProd) {
  const openInEditor = require('launch-editor-middleware')('phpstorm');
  router.get('editor', '/__open-in-editor', async (ctx) => {
    ctx.status = 200;
    openInEditor(ctx.req, ctx.res);
  });
}

mounts.forEach(([path, child]) => {
  router.use(path, child.routes(), child.allowedMethods());
});

router.controlFlow = function () {
  let isMountedPath = RegExp(
    `^(${mounts.map(([path]) => path).join('|')})(/.*)?$`,
  );
  return async (ctx, next) => {
    if (false === isMountedPath.test(ctx.url)) {
      await next();
    }
  };
};

module.exports = router;
