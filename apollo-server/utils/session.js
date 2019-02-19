const secret = process.env.SHARED_TOKEN_SECRET;

if (!secret || typeof secret !== 'string' || secret.length < 32) {
  throw new Error('SHARED_TOKEN_SECRET must be set and have at least 32 chars');
}

const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const argon2 = require('argon2');
const ms = require('ms');

const timers = {
  cache: '1m',
  session: '5m',
  cookie: '7d',
};
const sessionCache = {
  _storage: {},
  _lastFlush: Date.now(),
  flush(time = 0) {
    let flushCount = 0;
    if (!time || time > this._lastFlush + ms(timers.cache)) {
      Object.keys(this._storage).forEach(token => {
        if (!time || time > this._storage[token].reloadAfter) {
          delete this._storage[token];
          flushCount++;
        }
      });
      this._lastFlush = Date.now();
    }
    return flushCount;
  },
  read(token) {
    if (typeof token !== 'string') {
      throw new TypeError('Value for supplied argument `token` is invalid');
    }
    let now = Date.now();
    let cache = this._storage[token];
    if (cache && (now > cache.reloadAfter || now > cache.session.expires)) {
      cache = undefined;
      delete this._storage[token];
    }
    this.flush(now);
    return cache ? cache.session : undefined;
  },
  write(session) {
    let now = Date.now();
    this.flush(now);
    let reloadAfter = now + ms(timers.cache);
    this._storage[session.token] = { reloadAfter, session };
    return session;
  },
};
const defaultSession = {
  _id: '0',
  user: 'Guest',
  userRole: 'NONE',
  token: null,
  expires: -1,
  state: 'UNAUTHORIZED',
};
const verifyOptions = {
  algorithms: ['HS256'],
  audience: 'http://localhost:4000',
  issuer: 'http://localhost:4000',
  clockTolerance: 10,
};
const signOptions = {
  algorithm: 'HS256',
  expiresIn: timers.session,
  audience: 'http://localhost:4000',
  issuer: 'http://localhost:4000',
  mutatePayload: true,
  jwtid: uuidv4(),
};

module.exports = {
  async flush() {
    return sessionCache.flush();
  },
  async load($0, $1, ctx) {
    let user, payload, cached, token;
    try {
      token = ctx.req.cookies['apollo-token'];
    } catch (e) {
      token = undefined;
    }
    if (!token) {
      return defaultSession;
    }
    try {
      cached = sessionCache.read(token);
      if (cached) {
        return cached;
      }
      payload = jwt.verify(token, secret, verifyOptions);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { ...defaultSession, state: 'AUTH_EXPIRED' };
      } else {
        console.error(error);
        return { ...defaultSession, state: 'AUTH_ERROR' };
      }
    }
    /** @type Session */ const session = ctx.driver.session();
    const { records } = await session.run(
      'MATCH (user:User { email: $email }) RETURN user',
      { email: payload.sub },
    );
    try {
      user = records[0].toObject()['user']['properties'];
    } catch (error) {
      console.error(new Error(`User "${payload.sub}" could not be found`));
      return { ...defaultSession, state: 'AUTH_ERROR' };
    }
    return sessionCache.write({
      _id: 0,
      user: user.email,
      userRole: user.userRole,
      token,
      expires: payload.exp * 1000,
      state: 'AUTHORIZED',
    });
  },
  async login($0, params, ctx) {
    const email = params.email;
    const { isHash, value } = params.password;
    if (typeof isHash !== 'boolean' || !email || !value) {
      ctx.req.res.clearCookie('apollo-token');
      return { ...defaultSession, state: 'AUTH_ERROR' };
    }
    const input = isHash && /[0-9a-f]{64}/.test(value) ? value
      : crypto.createHash('sha256').update(value).digest('hex');
    const hashPromise = argon2.hash(input.slice(4) + input.slice(0, 4),
      { timeCost: 10, memoryCost: 2 ** 18, parallelism: 8 });
    let user, hash, substitute;
    /** @type Session */ const session = ctx.driver.session();
    const { records } = await session.run(
      'MATCH (user:User { email: $email }) RETURN user',
      { email },
    );
    try {
      user = records[0].toObject()['user']['properties'];
      hash = user['password'];
    } catch (error) {
      // Fail silently here because we will perform a pseudo verification
    }
    // Always wait for the substitute to keep the execution time on average
    substitute = await hashPromise;
    hash = hash ? hash : substitute;
    const isMatch = await argon2.verify(hash, input);
    if (isMatch && user && !user.frozen) {
      let payload = { sub: user.email };
      let token = jwt.sign(payload, secret, signOptions);
      ctx.req.res.cookie('apollo-token', token, {
        expires: new Date(Date.now() + ms(timers.cookie)),
        httpOnly: true,
        secure: false,
      });
      return sessionCache.write({
        _id: 0,
        user: user.email,
        userRole: user.userRole,
        token,
        expires: payload.exp * 1000,
        state: 'AUTHORIZED',
      });
    } else if (isMatch && user && user.frozen) {
      ctx.req.res.clearCookie('apollo-token');
      return { ...defaultSession, state: 'AUTH_FROZEN' };
    } else {
      ctx.req.res.clearCookie('apollo-token');
      return { ...defaultSession, state: 'AUTH_MISMATCH' };
    }
  },
  async logout($0, $1, ctx) {
    ctx.req.res.clearCookie('apollo-token');
    return defaultSession;
  },
};
