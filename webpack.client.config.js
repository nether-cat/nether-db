const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = merge(baseConfig, {
  target: 'web',
  entry: './lib/client/entry-client.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './public'),
    publicPath: '/',
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js',
    },
    extensions: ['*', '.js', '.vue', '.json'],
  },
  plugins: [
    new ManifestPlugin(),
    new VueSSRClientPlugin(),
    new HtmlWebpackPlugin({
      hash: true,
      title: 'Palim Database',
      template: './lib/client/index.html',
      filename: 'index.html',
    }),
  ],
});
