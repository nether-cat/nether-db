const { SchemaDirectiveVisitor } = require('graphql-tools');
const { defaultFieldResolver } = require('graphql');
const session = require('./utils/session');

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type['_requiredAuthRole'] = this.args.role;
  }

  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field['_requiredAuthRole'] = this.args.role;
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver || function () {} } = field;

      field.resolve = async function (...args) {
        // Get the required role from the field first, falling back
        // to the objectType if no role is required by the field:
        const needsRole = field._requiredAuthRole || objectType._requiredAuthRole;
        if (!needsRole) return resolve.apply(this, args);
        // Get the user's role from the context session
        const [,, { session: s } = {}] = args;
        if (!s || session.roles[s.userRole] < session.roles[needsRole]) {
          throw new Error(`Forbidden (${(Date.now() / 1000).toFixed(3)})`);
        }
        return resolve.apply(this, args);
      };
    });
  }
}

module.exports = {
  // Schema directives
  // https://www.apollographql.com/docs/graphql-tools/schema-directives
  auth: AuthDirective,
};
