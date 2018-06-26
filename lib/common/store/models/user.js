const { Base, BaseSchema, joi } = require('./base');

const UserSchema = BaseSchema.keys({
  loginName: joi.string().required(),
  email: joi.string().regex(/.+@.+\..+/i).required(),
});

class User extends Base {
  schema () {
    return UserSchema;
  }
}

module.exports = { User, UserSchema, joi };
