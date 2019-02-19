const { neo4jgraphql } = require('neo4j-graphql-js');
const GraphQLJSON = require('graphql-type-json');
const session = require('./utils/session');

module.exports = {
  // Schema resolvers
  // https://www.apollographql.com/docs/graphql-tools/resolvers.html
  JSON: GraphQLJSON,
  Query: {
    async Session(object, params, ctx) {
      return await ctx.session;
    },
    // eslint-disable-next-line no-unused-vars
    async Test(object, params, ctx, resolveInfo) {
      debugger;
      /** @type Session */ let session = ctx.driver.session();
      let queryResult = await session.run(
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
    Country(object, params, ctx, resolveInfo) {
      debugger;
      return neo4jgraphql(object, params, ctx, resolveInfo, true);
    },
  },
  Mutation: {
    // eslint-disable-next-line no-unused-vars
    async Login(...args) {
      return await session.login(...args);
    },
    // eslint-disable-next-line no-unused-vars
    async Logout(...args) {
      return await session.logout(...args);
    },
    // eslint-disable-next-line no-unused-vars
    async Test(object, params, ctx, resolveInfo) {
      debugger;
      /** @type Session */ let session = ctx.driver.session();
      let queryResult = await session.run(
        'MATCH (n0) WHERE id(n0) = toInteger($id) RETURN n0 AS node',
        { id: params._id, payload: params.payload },
      );
      return queryResult.records.map(record => {
        let node = record.toObject()['node'];
        return { _id: node.identity.toString(), ...node.properties };
      });
    },
    CreateCountry(object, params, ctx, resolveInfo) {
      debugger;
      return neo4jgraphql(object, params, ctx, resolveInfo, true);
    },
    DeleteCountry(object, params, ctx, resolveInfo) {
      debugger;
      return neo4jgraphql(object, params, ctx, resolveInfo, true);
    },
    UpdateCountry(object, params, ctx, resolveInfo) {
      debugger;
      return neo4jgraphql(object, params, ctx, resolveInfo, true);
    },
  },
};
