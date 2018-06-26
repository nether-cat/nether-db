const joi = require('joi');

const BaseSchema = joi.object().keys({
  id: joi.number(),
});

class Base {
  schema () {
    return BaseSchema || this;
  }

  constructor (obj) {
    if (this.constructor === Base) {
      throw new Error("Base class can't be instantiated!");
    }
    this.schema().validate(obj, (err, values) => {
      if (err) {
        throw new Error(err);
      }
      Object.assign(this, values);
    });
  }
}

module.exports = { Base, BaseSchema, joi };
