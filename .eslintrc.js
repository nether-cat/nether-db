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
    'comma-dangle': ['error', 'always-multiline'],
    'comma-style': ['error', 'last'],
    'graphql/template-strings': [
      'error',
      { 'env': 'literal', 'projectName': 'app' },
      { 'env': 'apollo', 'projectName': 'app' },
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
