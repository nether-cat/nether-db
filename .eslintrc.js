const secret = process.env.SHARED_TOKEN_SECRET;
if (!secret || typeof secret !== 'string' || secret.length < 32) {
  process.env.SHARED_TOKEN_SECRET = 'x'.repeat(32);
}
// TODO: Find a better workaround for ESLint

const { schema } = require('./apollo-server/utils/schema');
const { printSchema } = require('graphql');
const schemaString = printSchema(schema);

module.exports = {
  root: true,

  env: {
    node: true,
  },

  'extends': [
    'eslint:recommended',
    'plugin:vue/recommended',
  ],

  rules: {
    'array-bracket-spacing': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'always-multiline',
    }],
    'comma-style': ['error', 'last'],
    'graphql/template-strings': [
      'warn',
      { 'env': 'literal', schemaString, 'projectName': 'app' },
      { 'env': 'apollo', schemaString, 'projectName': 'app' },
    ],
    'no-console': 'off',
    'no-debugger': 'off',
    'no-extra-semi': 'off',
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'semi': ['error', 'always'],
    'semi-style': ['error', 'last'],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/html-closing-bracket-spacing': ['error', { 'selfClosingTag': 'never' }],
    'vue/max-attributes-per-line': ['error', {
      'singleline': 8,
      'multiline': {
        'max': 1,
        'allowFirstLine': true,
      },
    }],
    'vue/script-indent': 'warn',
    'vue/singleline-html-element-content-newline': 'off',
  },

  parserOptions: {
    parser: 'babel-eslint',
  },

  plugins: [
    'graphql',
    'vue',
  ],
};
