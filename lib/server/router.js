'use strict';

const Router = require('koa-router');

const router = new Router();

const mounts = [
  ['/api', require('./api')],
];

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
