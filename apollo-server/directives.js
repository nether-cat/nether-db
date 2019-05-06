const { SchemaDirectiveVisitor } = require('graphql-tools');
const { GraphQLID, defaultFieldResolver } = require('graphql');
const uuidv5 = require('uuid/v5');

class UniqueIdDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    const { name, from } = this.args;
    const fields = type.getFields();
    if (name in fields) {
      throw new Error(`Conflicting field name ${name}`);
    }
    fields[name] = {
      astNode: {
        directives: [],
      },
      name,
      type: GraphQLID,
      description: 'Unique ID',
      isDeprecated: false,
      args: [],
      resolve(object) {
        let uuid = uuidv5(type.name, process.env.VUE_APP_UUIDV5_ROOT);
        from.forEach(fieldName => {
          uuid = uuidv5(String(object[fieldName]), uuid);
        });
        return uuid;
      },
    };
  }
}

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
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole =
          field._requiredAuthRole ||
          objectType._requiredAuthRole;

        if (!requiredRole) {
          return resolve.apply(this, args);
        }

        const roles = {
          ADMIN: 4,
          MANAGER: 3,
          REVIEWER: 2,
          USER: 1,
          NONE: 0,
        };

        const [,, { session } = {}] = args;

        if (!session || roles[session.userRole] < roles[requiredRole]) {
          throw new Error('Forbidden');
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
  calcUID: UniqueIdDirective,
};
