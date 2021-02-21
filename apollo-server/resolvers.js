const { neo4jgraphql } = require('neo4j-graphql-js/src');
const { getNamedType } = require('graphql');
const { withFilter } = require('graphql-subscriptions');
const GraphQLJSON = require('graphql-type-json');
const session = require('./utils/session');

const ENTITY_UPDATED = 'EntityUpdated';
const subscriptions = {
  ENTITY_UPDATED,
}, $sub = subscriptions;

module.exports = {
  // Schema resolvers
  // https://www.apollographql.com/docs/graphql-tools/resolvers
  JSON: GraphQLJSON,
  Entity: {
    __resolveType(obj, ctx, info) {
      let returnType = getNamedType(info.returnType);
      let possibleTypes = info.schema.getPossibleTypes(returnType).map(({ name }) => name);
      return obj.types && obj.types.find(type => possibleTypes.includes(type)) || null;
    },
  },
  Permission: {
    __resolveType(obj) {
      if (obj.User) {
        return 'UserPermission';
      }

      if (obj.Group) {
        return 'GroupPermission';
      }
      return null;
    },
  },
  Query: {
    Session(obj, vars, ctx) {
      return ctx.session;
    },
    Credentials(...args) {
      return session.setPassword(...args);
    },
    Confirmation(...args) {
      return session.confirm(...args);
    },
    async Test(obj, vars, ctx) {
      /** @type Session */ let db = ctx.driver.session();
      let queryResult = await db.run(
        'MATCH (n0) WHERE id(n0) = toInteger($id) RETURN n0 AS node',
        { id: vars._id },
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
    async GetByUUID(obj, vars, ctx, info) {
      let actualSelections, selectionNode = { kind: 'Field', name: { kind: 'Name', value: 'types' } };
      let resolveNode = info.fieldNodes.find(({ name }) => name.value === info.fieldName);
      if (!resolveNode.selectionSet.selections.find(s => s.kind === 'Field' && s.name.value === 'types')) {
        actualSelections = resolveNode.selectionSet.selections;
        resolveNode.selectionSet.selections = resolveNode.selectionSet.selections.concat(selectionNode);
      }
      let result = await neo4jgraphql(obj, vars, ctx, info);
      if (actualSelections) {
        resolveNode.selectionSet.selections = actualSelections;
      }
      return result;
    },
    Country(...args) {
      return neo4jgraphql(...args);
    },
    Dataset(...args) {
      const [,, { neo4j }, { variableValues }] = args;
      variableValues.first = Number.isInteger(variableValues.first) ? neo4j.int(variableValues.first) : undefined;
      variableValues.offset = Number.isInteger(variableValues.offset) ? neo4j.int(variableValues.offset) : undefined;
      return neo4jgraphql(...args);
    },
    Event(...args) {
      return neo4jgraphql(...args);
    },
    Lake(...args) {
      return neo4jgraphql(...args);
    },
    User(...args) {
      return neo4jgraphql(...args);
    },
    CountNewUsers(...args) {
      return neo4jgraphql(...args);
    },
  },
  Mutation: {
    ContactStaff(obj, vars, ctx, info) {
      const { sender, message } = vars;
      try {
        session.sendMessage(sender, message, ctx.transport);
      } catch (err) {
        console.error(err);
        return { success: false };
      }
      return { success: true };
    },
    Login(...args) {
      return session.login(...args);
    },
    Logout(...args) {
      return session.logout(...args);
    },
    Forgot(...args) {
      return session.forgot(...args);
    },
    SetPassword(...args) {
      return session.setPassword(...args);
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
    UpdateLake(obj, vars, ctx, info) {
      return neo4jgraphql(obj, vars, ctx, info)
        .then(data => {
          let type = getNamedType(info.returnType).name;
          let event = { [ENTITY_UPDATED]: { types: [type, 'Entity'], ...data } };
          return ctx.pubsub.publish(ENTITY_UPDATED, event).then(() => data);
        });
    },
    UpdateUser(obj, vars, ctx, info) {
      let next = () => {};
      if (vars.emailVerified === false) {
        vars = { uuid: vars.uuid, emailVerified: false };
        next = user => session.sendVerification(user, ctx.transport);
      } else {
        vars = { ...vars, updated: { formatted: new Date().toISOString() } };
        if (vars.userRole !== 'NONE') {
          next = user => session.sendNotification(user, ctx.transport);
        }
      }
      let user = neo4jgraphql(obj, vars, ctx, info);
      user.then(next);
      return user;
    },
  },
  Subscription: {
    [ENTITY_UPDATED]: {
      subscribe: withFilter(
        (obj, vars, ctx, info) => ctx.pubsub.asyncIterator(ENTITY_UPDATED),
        (obj, vars, ctx, info) => !vars.types || vars.types.some(
          type => obj[ENTITY_UPDATED].types.includes(type),
        ),
      ),
    },
  },
};
