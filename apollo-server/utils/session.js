const secret = process.env.SHARED_TOKEN_SECRET;
const baseUrl = process.env.VUE_APP_BASE_URI || 'http://localhost:8000';
const graphqlUrl = process.env.VUE_APP_GRAPHQL_HTTP || 'http://localhost:4000/graphql';
const needAuthorization = JSON.parse(process.env.VUE_APP_AUTH_NEED_AUTHORIZATION || true);
const needVerification = JSON.parse(process.env.VUE_APP_AUTH_NEED_VERIFICATION || true);

if (!secret || typeof secret !== 'string' || secret.length < 32) {
  throw new Error('SHARED_TOKEN_SECRET must be set and have at least 32 chars');
}

const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const argon2 = require('argon2');
const ms = require('ms');

const { generateEmail } = require('./template');

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
  user: 'guest',
  userRole: 'NONE',
  token: null,
  expires: -1,
  state: 'UNAUTHORIZED',
  strictEnv: !!needAuthorization,
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
    if (!session.skip) {
      this._storage[session.token] = { reloadAfter, session };
    }
    return session;
  },
};
const sessionStates = {
  AUTHORIZED: 'AUTHORIZED',
  AUTH_APPROVAL: 'AUTH_APPROVAL',
  AUTH_EMAIL: 'AUTH_EMAIL',
  AUTH_ERROR: 'AUTH_ERROR',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_FROZEN: 'AUTH_FROZEN',
  AUTH_PENDING: 'AUTH_PENDING',
  AUTH_UNKNOWN: 'AUTH_UNKNOWN',
  UNAUTHORIZED: 'UNAUTHORIZED',
};
const userRoles = {
  NONE: 0,
  USER: 1,
  REVIEWER: 2,
  MANAGER: 3,
  ADMIN: 4,
};

Object.defineProperty(signOptions, 'jwtid', {
  enumerable: true,
  get: function () {
    return uuidv4();
  },
});

function getSessionToken (ctx) {
  let token;
  if (ctx.req) {
    token = ctx.req.cookies && ctx.req.cookies['apollo-token'];
    if (!token) {
      token = ctx.req.headers.authorization.split(' ')[1];
    }
  } else if (ctx.connection) {
    let ws = ctx.connection;
    if (ws.context && ws.context.connection) {
      ws = ws.context.connection;
    }
    token = ws.headers.authorization.split(' ')[1];
  }
  return token;
}

function sendRecovery (user, transport) {
  let href = `${baseUrl}/credentials?token=${
    jwt.sign({ sub: user.email, scope: ['recovery'] }, secret, { ...signOptions })
  }`;
  let subject = 'Account Recovery';
  let paragraphs = [
    `Hello ${user.fullName}!`,
    'An account recovery has been requested for this service.'
    + ' Click below to set a new password for your account.'
    + ' Please let us know, if you made no such request.',
  ];
  transport.sendMail({
    to: `"${user.fullName}" <${user.email}>`,
    subject,
    text: paragraphs.concat(href).join('\n\n'),
    html: generateEmail({
      subject,
      paragraphs,
      buttons: [{
        title: 'Recover my account',
        variant: 'primary',
        href,
      }],
    }),
  }).catch(console.error);
}

function sendVerification (user, transport) {
  let href = `${baseUrl}/confirm?token=${
    jwt.sign({ sub: user.email, scope: ['verification'] }, secret, { ...signOptions })
  }`;
  let subject = 'Account Verification';
  let paragraphs = [
    `Hello ${user.fullName}!`,
    'Your email address was linked with an account for this service.'
    + ' Click below to confirm that the email address is yours.'
    + ' Please let us know, if that is not your account.',
  ];
  transport.sendMail({
    to: `"${user.fullName}" <${user.email}>`,
    subject,
    text: paragraphs.concat(href).join('\n\n'),
    html: generateEmail({
      subject,
      paragraphs,
      buttons: [{
        title: 'Go to confirmation',
        variant: 'primary',
        href,
      }],
    }),
  }).catch(console.error);
}

function sendNotification (user, transport) {
  if (!user.userRole || user.userRole === 'NONE') {
    return;
  }
  let href = user.emailVerified || !needVerification ? `${baseUrl}/login` : `${baseUrl}/confirm?token=${
    jwt.sign({ sub: user.email, scope: ['verification'] }, secret, { ...signOptions })
  }`;
  let subject = 'Account Approval';
  let paragraphs = user.emailVerified || !needVerification ? [
    `Hello ${user.fullName}!`,
    'Your account for this service has been approved by a moderator.'
    + ' Use your email address and password for authentication.'
    + ' Click below to visit the website and log in.',
  ] : [
    `Hello ${user.fullName}!`,
    'Your account for this service has been approved by a moderator.'
    + ' However you have not verified your email address yet.'
    + ' Please click below to confirm that it is yours.',
  ];
  transport.sendMail({
    to: `"${user.fullName}" <${user.email}>`,
    subject,
    text: paragraphs.concat(href).join('\n\n'),
    html: generateEmail({
      subject,
      paragraphs,
      buttons: [{
        title: user.emailVerified || !needVerification ? 'Go to login' : 'Go to confirmation',
        variant: 'primary',
        href,
      }],
    }),
  }).catch(console.error);
}

function handleEmailToken(token, ref) {
  let email, scope, result = {};
  try {
    if (!token || typeof token !== 'string') {
      return { success: false, state: sessionStates.AUTH_ERROR };
    }
    ({ sub: email, scope } = jwt.verify(token, secret, verifyOptions));
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      try {
        ({ sub: email, scope } = jwt.verify(token, secret, { ...verifyOptions, ignoreExpiration: true }));
        result = { success: false, state: sessionStates.AUTH_EXPIRED };
      } catch (error) {
        console.error(error);
        return { success: false, state: sessionStates.AUTH_ERROR };
      }
    } else {
      console.error(error);
      return { success: false, state: sessionStates.AUTH_ERROR };
    }
  }
  return Object.assign(ref, { email, scope, result });
}

module.exports = {
  roles: userRoles,
  states: sessionStates,
  async flush() {
    return sessionCache.flush();
  },
  async load($0, $1, ctx) {
    let user, email, scope, exp, cached, token;
    try {
      token = getSessionToken(ctx);
    } catch (e) {
      token = undefined;
    }
    if (!token) {
      return { ...defaultSession };
    }
    try {
      cached = sessionCache.read(token);
      if (cached) {
        return cached;
      }
      ({ sub: email, scope, exp } = jwt.verify(token, secret, verifyOptions));
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { ...defaultSession, state: sessionStates.AUTH_EXPIRED };
      } else {
        console.error(error);
        return { ...defaultSession, state: sessionStates.AUTH_ERROR };
      }
    }
    if (scope !== 'session' && !Array.isArray(scope) || !scope.includes('session')) {
      return { ...defaultSession, state: sessionStates.AUTH_ERROR };
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
      return { ...defaultSession, state: sessionStates.AUTH_ERROR };
    }
    return sessionCache.write({
      _id: defaultSession._id,
      user: user.email,
      userRole: user.userRole,
      token,
      expires: exp * 1000,
      state: sessionStates.AUTHORIZED,
      strictEnv: defaultSession.strictEnv,
    });
  },
  async login($0, params, ctx) {
    const soft = params.soft;
    const { isHash, value } = params.password;
    const email = (params.email || '').trim().toLowerCase();
    if (typeof isHash !== 'boolean' || !email || !value) {
      ctx.req.res.clearCookie('apollo-token');
      return { ...defaultSession, state: sessionStates.AUTH_ERROR };
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
      if (!user.frozen && userRoles[user.userRole] && (!needVerification || user.emailVerified)) {
        let scope = ['session'];
        let payload = { sub: user.email, scope };
        let token = jwt.sign(payload, secret, { ...signOptions });
        if (soft !== true) {
          ctx.req.res.cookie('apollo-token', token, {
            expires: new Date(Date.now() + ms(timers.cookie)),
            httpOnly: true,
            secure: false,
          });
        }
        return sessionCache.write({
          _id: defaultSession._id,
          user: user.email,
          userRole: user.userRole,
          token,
          expires: payload.exp * 1000,
          state: sessionStates.AUTHORIZED,
          strictEnv: defaultSession.strictEnv,
          skip: soft === true,
        });
      } else if (user.frozen) {
        ctx.req.res.clearCookie('apollo-token');
        return { ...defaultSession, state: sessionStates.AUTH_FROZEN };
      } else if (needVerification && !user.emailVerified) {
        ctx.req.res.clearCookie('apollo-token');
        return { ...defaultSession, state: sessionStates.AUTH_EMAIL };
      } else if (!userRoles[user.userRole]) {
        ctx.req.res.clearCookie('apollo-token');
        return { ...defaultSession, state: sessionStates.AUTH_APPROVAL };
      }
    } else {
      if (soft !== true) {
        ctx.req.res.clearCookie('apollo-token');
      }
      return { ...defaultSession, state: sessionStates.AUTH_UNKNOWN };
    }
  },
  async logout($0, $1, ctx) {
    ctx.req.res.clearCookie('apollo-token');
    return { ...defaultSession };
  },
  async forgot($0, { email }, ctx) {
    email = (email || '').trim().toLowerCase();
    if (!email) {
      return { success: false };
    }
    try {
      /** @type Session */ const db = ctx.driver.session();
      const { records: [record] } = await db.run(`
        OPTIONAL MATCH (n:User {email: $email, frozen: false})
        RETURN {success: count(n) = 1, user: n {.email, .fullName, .titlePrefix, .userRole}} AS result
      `, { email });
      let result = record.toObject().result;
      if (result.success) {
        sendRecovery(result.user, ctx.transport);
      }
    } catch (error) {
      console.error(new Error(`Lookup with "${email}" failed`));
      return { success: false };
    }
    return { success: true };
  },
  async setPassword($0, { currentPassword, password, token }, ctx, { operation: { operation } }) {
    let email, scope, hash, ref, result = {}, transient = {};
    if (!token && ctx.session && ctx.session.token && (ctx.session.user || 'guest').toLowerCase() !== 'guest') {
      email = ctx.session.user;
      scope = ['session', 'recovery'];
      if (operation !== 'query') {
        if (!currentPassword || !currentPassword.value || typeof currentPassword.isHash !== 'boolean') {
          return { success: false, state: sessionStates.AUTH_ERROR };
        }
        let { state } = await this.login(0, { email, password: currentPassword, soft: true }, ctx);
        if (state !== sessionStates.AUTHORIZED) {
          return { success: false, state };
        }
      }
    } else if (!token && ctx.session && ctx.session.token && ctx.session.state === sessionStates.AUTH_EXPIRED) {
      email = ctx.session.user;
      scope = ['session', 'recovery'];
      result = { success: false, state: sessionStates.AUTH_EXPIRED };
    } else {
      ref = handleEmailToken(token, transient);
      if (ref === transient) {
        ({ email, scope, result } = ref);
      } else {
        return ref;
      }
    }
    if (scope !== 'recovery' && !Array.isArray(scope) || !scope.includes('recovery')) {
      return { success: false, state: sessionStates.AUTH_ERROR };
    }
    if (operation !== 'query' && result.state !== sessionStates.AUTH_EXPIRED) {
      if (!password || !password.value) {
        return { success: false, state: sessionStates.AUTH_ERROR };
      }
      hash = password.isHash && /[0-9a-f]{64}/.test(password.value) ? password.value
        : crypto.createHash('sha256').update(password.value).digest('hex');
      password = await argon2.hash(hash, { timeCost: 10, memoryCost: 2 ** 18, parallelism: 8 });
    } else {
      password = '';
    }
    const verifiedOnly = !!needVerification;
    const touchPassword = async (update = false) => {
      /** @type Session */ const db = ctx.driver.session();
      const { records: [record] } = await db.run(`
          OPTIONAL MATCH (n:User {email: $email, frozen: false})
          WHERE n.emailVerified = $verifiedOnly OR n.emailVerified = TRUE
          SET n.password = (CASE $update WHEN true THEN $password ELSE n.password END),
            n.updated = (CASE $update WHEN true THEN datetime() ELSE n.updated END)
          RETURN {success: count(n) = 1, user: n {.email, .fullName, .titlePrefix, .userRole}} as result
        `, { email, password, update, verifiedOnly });
      return record.toObject().result;
    };
    try {
      result = { state: sessionStates.AUTH_PENDING, ...(await touchPassword(false)), ...result };
      if (!result.user) {
        return { success: false, state: sessionStates.AUTH_ERROR };
      } else if (operation === 'query') {
        return result;
      }
    } catch (error) {
      console.error(new Error(`Lookup with "${email}" failed`));
      return { success: false, state: sessionStates.AUTH_ERROR };
    }
    if (result.state === sessionStates.AUTH_EXPIRED) {
      if (token) {
        sendRecovery(result.user, ctx.transport);
      }
      return { ...result, success: !!token };
    }
    try {
      result = { state: sessionStates.AUTHORIZED, ...(await touchPassword(true)) };
      if (!result.user) {
        return { success: false, state: sessionStates.AUTH_ERROR };
      } else {
        return result;
      }
    } catch (error) {
      console.error(new Error(`Recovery with "${email}" failed`));
      return { success: false, state: sessionStates.AUTH_ERROR };
    }
  },
  async signup($0, { user, probeOnly }, ctx) {
    if (!user || !user.email || !user.email.trim()) {
      return { success: false };
    } else {
      user.email = user.email.trim().toLowerCase();
    }
    if (probeOnly) {
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
            user.frozen = false,
            user.updated = datetime(),
            user.created = user.updated
          RETURN count(user) = 1 AS success
        `, { user });
        let result = record.toObject();
        if (result.success) {
          sendVerification(user, ctx.transport);
        }
        return result;
      } catch (error) {
        console.error(new Error(`Signup with "${user.email}" failed`));
        return { success: false };
      }
    }
  },
  async confirm($0, { token }, ctx, { operation: { operation } }) {
    let email, scope, result, ref, transient = {};
    ref = handleEmailToken(token, transient);
    if (ref === transient) {
      ({ email, scope, result } = ref);
    } else {
      return ref;
    }
    if (scope !== 'verification' && !Array.isArray(scope) || !scope.includes('verification')) {
      return { success: false, state: sessionStates.AUTH_ERROR };
    }
    const touchEmailVerified = async (confirm = false) => {
      /** @type Session */ const db = ctx.driver.session();
      const { records: [record] } = await db.run(`
          OPTIONAL MATCH (n:User {email: $email, frozen: false})
          SET n.emailVerified = (n.emailVerified OR $confirm),
            n.updated = (CASE $confirm WHEN true THEN datetime() ELSE n.updated END)
          RETURN {success: count(n) = 1, user: n {.email, .fullName, .titlePrefix, .userRole}} as result
        `, { email, confirm });
      return record.toObject().result;
    };
    try {
      result = { state: sessionStates.AUTH_EMAIL, ...(await touchEmailVerified(false)), ...result };
      if (!result.user) {
        return { success: false, state: sessionStates.AUTH_ERROR };
      } else if (operation === 'query') {
        return result;
      }
    } catch (error) {
      console.error(new Error(`Lookup with "${email}" failed`));
      return { success: false, state: sessionStates.AUTH_ERROR };
    }
    if (result.state === sessionStates.AUTH_EXPIRED) {
      sendVerification(result.user, ctx.transport);
      return { ...result, success: true };
    }
    try {
      result = { state: sessionStates.AUTH_PENDING, ...(await touchEmailVerified(true)) };
      if (!result.user) {
        return { success: false, state: sessionStates.AUTH_ERROR };
      } else if (!userRoles[result.user.userRole]) {
        return { ...result, state: sessionStates.AUTH_APPROVAL };
      } else {
        return result;
      }
    } catch (error) {
      console.error(new Error(`Confirmation with "${email}" failed`));
      return { success: false, state: sessionStates.AUTH_ERROR };
    }
  },
  async revoke($0, params, ctx) {
    return { success: false };
  },
  sendRecovery,
  sendVerification,
  sendNotification,
};
