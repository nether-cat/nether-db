const secret = process.env.SHARED_TOKEN_SECRET;
const baseUrl = 'http://localhost:8000';
const graphqlUrl = 'http://localhost:4000/graphql';

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
  session: '1d',
  cookie: '7d',
};
const verifyOptions = {
  algorithms: ['HS256'],
  audience: baseUrl,
  issuer: graphqlUrl,
  clockTolerance: 10,
};
const signOptions = {
  algorithm: 'HS256',
  expiresIn: timers.session,
  audience: baseUrl,
  issuer: graphqlUrl,
  mutatePayload: true,
};
const defaultSession = {
  _id: 'SESSION_INFO',
  user: 'Guest',
  userRole: 'NONE',
  token: null,
  expires: -1,
  state: 'UNAUTHORIZED',
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

Object.defineProperty(signOptions, 'jwtid', {
  enumerable: true,
  get: function () {
    return uuidv4();
  },
});

function sendConfirmation (user, transport) {
  let scope = ['validation'];
  let token = jwt.sign({ sub: user.email, scope }, secret, { ...signOptions });
  transport.sendMail({
    to: `"${user.fullName}" <${user.email}>`,
    subject: 'Account Verification',
    text: `Hi ${user.fullName}! \n\n`
      + 'Please click the following link to confirm your email address: \n\n'
      + `http://localhost:8000/confirm?token=${token} \n\n`,
    html: `<h4>Hi ${user.fullName}!</h4> Please click `
      + `<a href="http://localhost:8000/confirm?token=${token}">this link</a> `
      + 'to confirm your email address.',
  }).catch(console.error);
}

module.exports = {
  async flush() {
    return sessionCache.flush();
  },
  async load($0, $1, ctx) {
    let user, email, scope, exp, cached, token;
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
      ({ sub: email, scope, exp } = jwt.verify(token, secret, verifyOptions));
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { ...defaultSession, state: 'AUTH_EXPIRED' };
      } else {
        console.error(error);
        return { ...defaultSession, state: 'AUTH_ERROR' };
      }
    }
    if (scope !== 'session' && !Array.isArray(scope) || !scope.includes('session')) {
      return { ...defaultSession, state: 'AUTH_ERROR' };
    }
    try {
      /** @type Session */ const db = ctx.driver.session();
      const { records: [record] } = await db.run(`
        MATCH (user:User {email: $email})
        RETURN user
      `, { email });
      user = record.toObject()['user']['properties'];
    } catch (error) {
      console.error(new Error(`User "${email}" could not be found`));
      return { ...defaultSession, state: 'AUTH_ERROR' };
    }
    return sessionCache.write({
      _id: 'SESSION_INFO',
      user: user.email,
      userRole: user.userRole,
      token,
      expires: exp * 1000,
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
    try {
      /** @type Session */ const db = ctx.driver.session();
      const { records: [record] } = await db.run(
        'MATCH (user:User { email: $email }) RETURN user',
        { email },
      );
      user = record.toObject()['user']['properties'];
      hash = user['password'];
    } catch (error) {
      // Fail silently here because we will perform a pseudo verification
    }
    // Always wait for the substitute to keep the execution time on average
    substitute = await hashPromise;
    hash = hash ? hash : substitute;
    const isMatch = await argon2.verify(hash, input);
    if (isMatch && user) {
      if (!user.frozen && user.emailVerified) {
        let scope = ['session'];
        let payload = { sub: user.email, scope };
        let token = jwt.sign(payload, secret, { ...signOptions });
        ctx.req.res.cookie('apollo-token', token, {
          expires: new Date(Date.now() + ms(timers.cookie)),
          httpOnly: true,
          secure: false,
        });
        return sessionCache.write({
          _id: 'SESSION_INFO',
          user: user.email,
          userRole: user.userRole,
          token,
          expires: payload.exp * 1000,
          state: 'AUTHORIZED',
        });
      } else if (user.frozen) {
        ctx.req.res.clearCookie('apollo-token');
        return { ...defaultSession, state: 'AUTH_FROZEN' };
      } else if (!user.emailVerified) {
        ctx.req.res.clearCookie('apollo-token');
        return { ...defaultSession, state: 'AUTH_EMAIL' };
      }
    } else {
      ctx.req.res.clearCookie('apollo-token');
      return { ...defaultSession, state: 'AUTH_UNKNOWN' };
    }
  },
  async logout($0, $1, ctx) {
    ctx.req.res.clearCookie('apollo-token');
    return defaultSession;
  },
  async signup($0, { user, probeOnly }, ctx) {
    if (!user || !user.email) {
      return { success: false };
    } else if (probeOnly) {
      try {
        /** @type Session */ const db = ctx.driver.session();
        const { records: [record] } = await db.run(`
          MATCH (user:User {email: $user.email})
          RETURN count(user) = 0 AS success
        `, { user });
        return record.toObject();
      } catch (error) {
        console.error(new Error(`Testing with "${user.email}" failed`));
        return { success: false };
      }
    } else {
      user.password = await argon2.hash((
        !user.password.isHash || !/[0-9a-f]{64}/.test(user.password.value)
          ? crypto.createHash('sha256').update(user.password.value).digest('hex')
          : user.password.value
      ), { timeCost: 10, memoryCost: 2 ** 18, parallelism: 8 });
      try {
        /** @type Session */ const db = ctx.driver.session();
        const { records: [record] } = await db.run(`
          MATCH (user:User {email: $user.email})
          WITH (CASE WHEN count(user) > 0 THEN [] ELSE [$user] END) AS input
          UNWIND input AS data
          CREATE (user:User:Entity {uuid: randomUUID()})
          SET user += data,
            user.userRole = 'NONE',
            user.deactivated = false,
            user.emailVerified = false,
            user.frozen = false
          RETURN count(user) = 1 AS success
        `, { user });
        let result = record.toObject();
        if (result.success) {
          sendConfirmation(user, ctx.transport);
        }
        return result;
      } catch (error) {
        console.error(new Error(`Signup with "${user.email}" failed`));
        return { success: false };
      }
    }
  },
  async confirm($0, { token }, ctx, { operation: { operation } }) {
    let email, scope, result = {};
    try {
      ({ sub: email, scope } = jwt.verify(token, secret, verifyOptions));
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        try {
          ({ sub: email, scope } = jwt.verify(token, secret, { ...verifyOptions, ignoreExpiration: true }));
          result = { success: false, state: 'AUTH_EXPIRED' };
        } catch (error) {
          console.error(error);
          return { success: false, state: 'AUTH_ERROR' };
        }
      } else {
        console.error(error);
        return { success: false, state: 'AUTH_ERROR' };
      }
    }
    if (scope !== 'validation' && !Array.isArray(scope) || !scope.includes('validation')) {
      return { success: false, state: 'AUTH_ERROR' };
    }
    const touchUser = async (confirm = false) => {
      /** @type Session */ const db = ctx.driver.session();
      const { records: [record] } = await db.run(`
          OPTIONAL MATCH (n:User {email: $email, frozen: false})
          SET n.emailVerified = (n.emailVerified OR $confirm)
          RETURN {success: count(n) = 1, user: n {.email, .fullName, .titlePrefix}} as result
        `, { email, confirm });
      return record.toObject().result;
    };
    try {
      result = { state: 'AUTH_EMAIL', ...(await touchUser(false)), ...result };
      if (!result.user) {
        return { success: false, state: 'AUTH_ERROR' };
      } else if (operation === 'query') {
        return result;
      }
    } catch (error) {
      console.error(new Error(`Lookup with "${email}" failed`));
      return { success: false, state: 'AUTH_ERROR' };
    }
    if (result.state === 'AUTH_EXPIRED') {
      sendConfirmation(result.user, ctx.transport);
      return { ...result, success: true };
    }
    try {
      result = { state: 'AUTH_EMAIL', ...(await touchUser(true)) };
      if (!result.user) {
        return { success: false, state: 'AUTH_ERROR' };
      } else {
        return result;
      }
    } catch (error) {
      console.error(new Error(`Confirmation with "${email}" failed`));
      return { success: false, state: 'AUTH_ERROR' };
    }
  },
  async revoke($0, params, ctx) {
    return { success: false };
  },
};
