'use strict';

const fs = require('fs');
const path = require('path');
const seraph = require('seraph');
const promisify = require('util').promisify;
const basename = path.basename(__filename);
const config = require('../config');
const db = seraph(config['seraph']['options']);
const ModelPrototype = require('seraph-model').modelPrototype;

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

// Invalid input 'n': expected whitespace, comment, '{', node labels, MapLiteral, a parameter, a relationship pattern, '(', '.', '[', "=~", IN, STARTS, ENDS, CONTAINS, IS, '^', '*', '/', '%', '+', '-', '=', "<>", "!=", '<', '>', "<=", ">=", AND, XOR, OR, LOAD CSV, FROM, INTO, START, MATCH, UNWIND, MERGE, CREATE GRAPH >>, CREATE >> GRAPH, CREATE GRAPH, CREATE, SET, DELETE GRAPHS, DELETE, REMOVE, FOREACH, WITH, CALL, PERSIST, RELOCATE, RETURN, SNAPSHOT, UNION, ';' or end of input (line 1, column 38 (offset: 37))
// "MATCH (node:Publication) WHERE  WITH node WHERE (node:Publication) OPTIONAL MATCH (node)-[__sm_r0:`CREATED_BY`]->(__sm_level0) RETURN node,timestamp() as __sm_ts,COLLECT( __sm_level0 ) as __sm_level0,COLLECT( DISTINCT __sm_r0 ) as __sm_r0"
//                                       ^

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
  Object.defineProperty(this, 'promised', {
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

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(db);
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
