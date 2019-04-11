const fs = require('fs');
const path = require('path');
const schemaFile = path.resolve(__dirname, './apollo-server/schema.graphql');
const schemaString = fs.readFileSync(schemaFile, 'utf8');

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
      { 'env': 'literal', 'projectName': 'app', schemaString },
      { 'env': 'apollo', 'projectName': 'app', schemaString },
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
    'vue/name-property-casing': ['error', 'kebab-case'],
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
