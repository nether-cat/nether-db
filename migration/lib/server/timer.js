'use strict';

const timer = function () {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  };
};

module.exports = timer;
