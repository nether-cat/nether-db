module.exports = function cypher(strings, ...values) {
  return String.raw(strings, ...values);
};
