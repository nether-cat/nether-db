'use strict';

const env = process.env.NODE_ENV || 'development';
const config = require('./config.json')[env];
const merge = require('deepmerge');
const path = require('path');
const defaults = {
  'app': {
    'name': 'PaLim Database',
    'shortName': 'PaLimDB',
    'paths': {
      'root': path.normalize(__dirname + '/..'),
      'public': path.normalize(__dirname + '/../dist'),
    },
    'urls': {
      'local': 'http://localhost:3000',
      'public': 'http://localhost:3000',
    },
  },
  'koa': {
    'keys': [
      'secret-key',
    ],
    'jwt': {
      'cookie': 'jwt:token',
      'secret': 'shared-secret',
      'refresh': '1m',
      'preset': {
        'algorithm': 'HS256',
        'expiresIn': '60m',
        'audience': 'http://localhost:3000',
        'issuer': 'http://localhost:3000',
      },
    },
  },
  'seraph': {
    'options': {
      'server': 'http://localhost:7474',
      'endpoint': '/db/data',
      'user': 'neo4j',
      'pass': 'neo4j',
      'id': 'id',
      'agent': null,
      'xstream': false,
    },
  },
};
module.exports = defaults;
module.exports = merge(defaults, config, {
  arrayMerge: (destination, source) => source,
}) || defaults;
