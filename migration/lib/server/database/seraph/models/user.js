'use strict';

module.exports = (seraphDb) => {
  const User = require('seraph-model')(seraphDb, 'User');
  User.schema = {
    login_name: {type: String, required: true},
    first_name: String,
    last_name: String,
    role: String,
    institution: String,
    department: String,
    email: {type: String, required: true},
  };
  User.usingWhitelist = true;
  User.useTimestamps();
  return User;
};
