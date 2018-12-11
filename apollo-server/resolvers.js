//const { neo4jgraphql } = require('neo4j-graphql-js');
const GraphQLJSON = require('graphql-type-json');

module.exports = {
  // Schema resolvers
  // https://www.apollographql.com/docs/graphql-tools/resolvers.html
  JSON: GraphQLJSON,
  Query: {
    // eslint-disable-next-line no-unused-vars
    Something(object, params, ctx, resolveInfo) {
      debugger;
      return [{ id: 1, data: { field: 'content' }, _id: 'empty' }];
      //return neo4jgraphql(object, params, ctx, resolveInfo, true);
    },
    // eslint-disable-next-line no-unused-vars
    async Test(object, params, ctx, resolveInfo) {
      debugger;
      /** @type Session */ let session = ctx.driver.session();
      let queryResult = await session.run(
        `
        MATCH (n0:Actor) WHERE id(n0) = toInteger($id) RETURN n0 AS record
        `,
        { id: Number(params.id) },
      );
      return queryResult.records.map(row => {
        let record = row.get('record');
        return { ...record.properties, id: record.identity };
      });
    },
  },
  Mutation: {
    // eslint-disable-next-line no-unused-vars
    CreateSomething(object, params, ctx, resolveInfo) {
      debugger;
      return [{ id: 1, data: { field: 'content' }, _id: 'empty' }];
      //return neo4jgraphql(object, params, ctx, resolveInfo, true);
    },
  },
};
