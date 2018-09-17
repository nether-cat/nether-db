const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const configParams = require('./config');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  output: {
    path: configParams.app.paths.public
  },
  resolve: {
    alias: {
      '@client': configParams.app.paths.root + '/lib/client',
      '@server': configParams.app.paths.root + '/lib/server',
    },
    extensions: ['*', '.js', '.vue', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false,
          },
        },
      },
      {
        test: /\.js$/,
        exclude: file => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        ),
        loader: 'babel-loader',
        options: {
          presets: ['env'],
          plugins: ['syntax-dynamic-import', 'transform-object-rest-spread'],
        },
      },
      {
        test: /\.(s)?css$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader', 'resolve-url-loader', 'sass-loader?sourceMap'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[hash].[ext]',
        },
      },
      {
        test: /.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[hash].[ext]',
        },
      },
      {
        test: /\.csv$/,
        loader: 'file-loader',
        options: {
          name: 'resources/[name].[hash].[ext]',
        },
      },
    ],
  },
  performance: {
    maxEntrypointSize: 300000,
    hints: isProd ? 'warning' : false,
  },
  plugins: isProd ? [
    new VueLoaderPlugin(),
  ] : [
    new VueLoaderPlugin(),
    new FriendlyErrorsPlugin(),
  ],
};
