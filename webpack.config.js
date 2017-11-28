const path = require('path');
const process = require('process');
const webpack = require('webpack');

module.exports = {
  entry: './browser/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public'),
    publicPath: '/public/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          },
        },
      },
      {
        test: /\.(png|jpg|gif|svg|html)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]',
          },
        },
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            loaders: {
              'scss': 'vue-style-loader!css-loader!sass-loader',
              'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
            },
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js',
    },
  },
  performance: {
    hints: 'warning',
  },
  devtool: '#eval-source-map',
  target: 'web',
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: true,
    }),
  ],
};

if (process.env['NODE_ENV'] === 'production') {
  module.exports.devtool = '#source-map';
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG: false,
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false,
      },
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  ]);
}
