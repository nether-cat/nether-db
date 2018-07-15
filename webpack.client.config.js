const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');
const DefinePlugin = require('webpack').DefinePlugin;
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const configParams = require('./config');

const isProd = process.env.NODE_ENV === 'production';

module.exports = merge(baseConfig, {
  target: 'web',
  entry: ['regenerator-runtime/runtime', './lib/client/entry-client.js'],
  devtool: isProd ? false : 'source-map',
  output: {
    filename: '[name].bundle.[hash].js',
    chunkFilename: '[name].bundle.[chunkhash].js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js',
    },
  },
  node: {
    net: 'empty',
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
    new DefinePlugin({
      'process.env.VUE_API_URL': JSON.stringify(configParams.app.urls.public + '/api'),
    }),
  ],
});
