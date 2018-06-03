const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const configParams = require('./config');

const isProd = process.env.NODE_ENV === 'production';

module.exports = merge(baseConfig, {
  target: 'web',
  entry: './lib/client/entry-client.js',
  output: {
    filename: '[name].bundle.js?[hash]',
    path: path.resolve(__dirname, './dist/bundle-client'),
    publicPath: '/',
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js',
    },
  },
  plugins: [
    new ManifestPlugin(),
    new VueSSRClientPlugin(),
    new HtmlWebpackPlugin({
      hash: true,
      title: configParams.app.name,
      template: './lib/client/template.html',
      filename: './app/index.html',
    }),
  ],
});
