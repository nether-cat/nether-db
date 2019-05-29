const { neo4jgraphql } = require('neo4j-graphql-js');
const GraphQLJSON = require('graphql-type-json');
const session = require('./utils/session');

module.exports = {
  // Schema resolvers
  // https://www.apollographql.com/docs/graphql-tools/resolvers
  JSON: GraphQLJSON,
  Query: {
    Session(object, params, ctx) {
      return ctx.session;
    },
    Confirmation(...args) {
      return session.confirm(...args);
    },
    // eslint-disable-next-line no-unused-vars
    async Test(object, params, ctx, resolveInfo) {
      /** @type Session */ let db = ctx.driver.session();
      let queryResult = await db.run(
        'MATCH (n0) WHERE id(n0) = toInteger($id) RETURN n0 AS node',
        { id: params._id },
      );
      return queryResult.records.map(record => {
        let node = record.toObject()['node'];
        // This example shows how to handle Neo4j integers, but with the
        // identity this should not be done as GraphQL expects a string.
        //
        // let identity = ctx.neo4j.integer.inSafeRange(node.identity)
        //   ? node.identity.toNumber() : node.identity.toString();
        return { _id: node.identity.toString(), ...node.properties };
      });
    },
    async RecordsByDataset(object, params, ctx) {
      /** @type Session */ let db = ctx.driver.session();
      let queryResult = await db.run(
        'MATCH (n0:Record)-[r0:RECORDED_IN]->(:Dataset {uuid: $uuid}) RETURN n0 AS record ORDER BY r0.__rowNum__ ASC',
        { uuid: params.uuid },
      );
      return queryResult.records.map((row, __rowNum__) => {
        let { record } = row.toObject();
        return { _id: record.identity.toString(), data: { ...record.properties, __rowNum__ } };
      });
    },
    Country(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo, true);
    },
    Lake(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo, true);
    },
  },
  Mutation: {
    Login(...args) {
      return session.login(...args);
    },
    Logout(...args) {
      return session.logout(...args);
    },
    Signup(...args) {
      return session.signup(...args);
    },
    Confirm(...args) {
      return session.confirm(...args);
    },
    Revoke(...args) {
      return session.revoke(...args);
    },
    // eslint-disable-next-line no-unused-vars
    async Test(object, params, ctx, resolveInfo) {
      /** @type Session */ let db = ctx.driver.session();
      let queryResult = await db.run(
        'MATCH (n0) WHERE id(n0) = toInteger($id) RETURN n0 AS node',
        { id: params._id, payload: params.payload },
      );
      return queryResult.records.map(record => {
        let node = record.toObject()['node'];
        return { _id: node.identity.toString(), ...node.properties };
      });
    },
  },
};
