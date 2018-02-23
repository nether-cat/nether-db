'use strict';

const fs = require('fs');
const path = require('path');
const seraph = require('seraph');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = seraph(config['seraph']['options']);
const modelPrototype = require('seraph-model').modelPrototype;

db['models'] = {};

modelPrototype.fixWhitelist = function () {
  if (this['usingWhitelist'] && !this.fields.length) {
    if (Object.keys(this.compositions).length || Object.keys(this.schema || {}).length) {
      this.fields.push(undefined);
    }
  }
};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(db);
    db['models'][model.type] = model;
  });

Object.keys(db['models']).forEach(type => {
  if (typeof db['models'][type].setup === 'function') {
    db['models'][type].setup();
  }
  db['models'][type].fixWhitelist();
});

module.exports = db;
