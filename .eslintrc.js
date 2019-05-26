const fs = require('fs');
const path = require('path');
const serverSchema = path.resolve(__dirname, './apollo-server/schema.graphql');
const clientSchema = path.resolve(__dirname, './src/graphql/local-state/schema.graphql');
const schemaString = `
${fs.readFileSync(serverSchema, 'utf8')}
${fs.readFileSync(clientSchema, 'utf8')}
`;

module.exports = {
  root: true,

  env: {
    node: true,
  },

  globals: {
    ESLint$0: 'readonly',
    ESLint$1: 'readonly',
  },

  extends: [
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
      { 'env': 'apollo', 'projectName': 'app', tagName: 'gql', schemaString },
      { 'env': 'apollo', 'projectName': 'app', tagName: 'ESLint$1.gql', schemaString },
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
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/html-closing-bracket-spacing': ['error', { 'selfClosingTag': 'never' }],
    'vue/max-attributes-per-line': ['error', {
      'singleline': 8,
      'multiline': {
        'max': 1,
        'allowFirstLine': true,
      },
    }],
    'vue/name-property-casing': ['error', 'PascalCase'],
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
