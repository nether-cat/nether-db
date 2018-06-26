'use strict';

const fs = require('fs');
const path = require('path');
const seraph = require('seraph');
const promisify = require('util').promisify;
const ModelPrototype = require('seraph-model').modelPrototype;
const config = require('../../../../config');

const db = seraph(config['seraph']['options']);
const basename = path.basename(__filename);

/**
 * @class Model
 * @mixes {ModelPrototype}
 */

const _promisifiedFunctions = {
  save: promisify(ModelPrototype.save),
  query: promisify(ModelPrototype.query),
  where: promisify(ModelPrototype.where),
};

const _wrapPromisifiedFunction = (operation, errorMessage) => {
  return function (...args) {
    let finalError = new Error(errorMessage);
    return _promisifiedFunctions[operation]
      .call(this['parent'], ...args)
      .catch(cause => {
        cause = cause.stack ?
          cause.stack :
          cause.message ?
            cause.message : cause;
        console.error(cause);
        throw finalError;
      });
  };
};

function PromisifiedInterface(parent) {
  // noinspection JSUnusedGlobalSymbols
  this.parent = parent;
}

/**
 * @param object
 * @param [excludeComps]
 * @returns {Promise}
 */
PromisifiedInterface.prototype.save = function(object, excludeComps) {};
PromisifiedInterface.prototype.save = _wrapPromisifiedFunction('save', 'Saving the model in the Neo4j database failed');
/**
 * @param query
 * @param [params]
 * @param [opts]
 */
PromisifiedInterface.prototype.query = function(query, params, opts) {};
PromisifiedInterface.prototype.query = _wrapPromisifiedFunction('query', 'Custom query to the Neo4j database failed');
/**
 * @param predicate
 * @param [opts]
 * @returns {Promise}
 */
PromisifiedInterface.prototype.where = function(predicate, opts) {};
PromisifiedInterface.prototype.where = _wrapPromisifiedFunction('where', 'Search query to the Neo4j database failed');


ModelPrototype.applyFixes = function applyFixes () {
  /**
   * @type {PromisifiedInterface}
   */
  Object.defineProperty(this, 'promise', {
    value: new PromisifiedInterface(this),
    enumerable: false,
    configurable: false,
    writable: false,
  });
  if (this['usingWhitelist'] && !this.fields.length) {
    if (Object.keys(this.compositions).length || Object.keys(this.schema || {}).length) {
      this.fields.push(undefined);
    }
  }
};

console.log('Initializing models...');

const modelPath = path.resolve(__dirname, './models');

fs.readdirSync(modelPath)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(modelPath, file))(db);
    if (!db.models) db.models = {};
    db.models[model.type] = model;
  });

Object.keys(db.models).forEach(type => {
  if (typeof db.models[type].setup === 'function') {
    db.models[type].setup();
  }
  db.models[type].applyFixes();
});

module.exports = db;
