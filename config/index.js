"use strict";

const env = process.env.NODE_ENV || 'development';
const config = require('./config.json')[env];
const merge = require('deepmerge');
const path = require('path');
const defaults = {
  'app': {
    'root': path.normalize(__dirname + '/../'),
    'public': path.normalize(__dirname + '/../public/'),
  },
  'koa': {
    'keys': ['secret-key'],
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
module.exports = merge(defaults, config, {
  arrayMerge: (destination, source) => source
});