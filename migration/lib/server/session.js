'use strict';

const ms = require('ms');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const config = require('../../config');

const session = {},
  mutatePayload = true,
  name = config.koa.jwt.cookie,
  secret = config.koa.jwt.secret,
  preset = config.koa.jwt.preset,
  refresh = Math.floor(
    ms(config.koa.jwt.refresh) / 1000,
  );

session.initialize = function (ctx, payload, opts = {}) {
  if (ctx.request.query['acceptCookies'] !== undefined) {
    // TODO: Determine how to handle EU legislation on cookies
  }
  let options = { ...preset, ...opts, mutatePayload, jwtid: uuidv4() };
  let token = jwt.sign(payload, secret, options);
  ctx.cookies.set(name, token);
  ctx.state.jwt = { token, payload };
};

session.terminate = function (ctx) {
  ctx.cookies.set(name);
  ctx.state.jwt = undefined;
};

session.middleware = function () {
  return async (ctx, next) => {
    let token, payload;
    if (token = ctx.cookies.get(name)) {
      let verifyOptions = {
        algorithms: [preset.algorithm],
        audience: preset.audience,
        issuer: preset.issuer,
        clockTolerance: 5,
      };
      try {
        payload = jwt.verify(token, secret, verifyOptions);
        let tokenAge = Math.floor(Date.now() / 1000) - payload.iat;
        if (tokenAge >= refresh) {
          payload = Object.entries(payload)
            .filter(([key]) => !['aud', 'iss', 'exp', 'iat'].includes(key))
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
          token = jwt.sign(payload, secret, { ...preset, mutatePayload });
          ctx.cookies.set(name, token);
        }
        ctx.state.jwt = { token, payload };
      } catch (err) {
        ctx.cookies.set(name);
        console.error(err);
      }
    }
    await next();
  };
};

module.exports = session;
