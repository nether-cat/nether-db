const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? false : 'eval-source-map',
  resolve: {
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
          plugins: ['syntax-dynamic-import'],
        },
      },
      {
        test: /\.(s)?css$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
      {
        test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
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
