const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');
const DefinePlugin = require('webpack').DefinePlugin;
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const nodeExternals = require('webpack-node-externals');
const configParams = require('./config');

const isProd = process.env.NODE_ENV === 'production';

module.exports = merge(baseConfig, {
  target: 'node',
  entry: ['regenerator-runtime/runtime', './lib/client/entry-server.js'],
  devtool: isProd ? false : 'source-map',
  output: {
    filename: '[name].ssr-bundle.js',
    publicPath: '/',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js',
    },
  },
  // https://webpack.js.org/configuration/externals/#function
  // https://github.com/liady/webpack-node-externals
  // Externalize app dependencies. This makes the server build much faster
  // and generates a smaller bundle file.
  externals: nodeExternals({
    // do not externalize dependencies that need to be processed by webpack.
    // you can add more file types here e.g. raw *.vue files
    // you should also whitelist deps that modifies `global` (e.g. polyfills)
    whitelist: [
      /\.less$/,
      /\.(s)css$/,
      /^bootstrap-vue/,
      /^joi/,
      /^regenerator-runtime/,
    ],
  }),
  // This is the plugin that turns the entire output of the server build
  // into a single JSON file. The default file name will be
  // `vue-ssr-server-bundle.json`
  plugins: [
    new VueSSRServerPlugin(),
    new DefinePlugin({
      'process.env.VUE_API_URL': JSON.stringify(configParams.app.urls.local + '/api'),
    }),
  ],
});
