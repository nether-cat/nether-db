const path = require('path');
const { schema } = require('./apollo-server/utils/setup');
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  lintOnSave: true,

  pwa: {
    name: 'nether-db',
  },

  baseUrl: undefined,
  outputDir: undefined,
  assetsDir: 'assets',
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined,

  css: {
    sourceMap: true,
  },

  indexPath: 'index.client.html',

  devServer: {
    index: 'index.client.html',
  },

  chainWebpack: config => {
    let templateParameters = () => {};
    config.plugin('html')
      .tap(([args]) => {
        args.filename = 'index.client.html';
        args.template = path.resolve(__dirname, './public/index.client.html');
        templateParameters = args.templateParameters;
        return [args];
      });
    config.plugin('html-ssr')
      .after('html')
      .use(require.resolve('html-webpack-plugin'), [{
        filename: 'index.server.html',
        template: path.resolve(__dirname, './public/index.server.html'),
        templateParameters,
      }]);
    config.module.rule('eslint').use('eslint-loader').loader('eslint-loader')
      .tap(options => {
        options.emitError = isProd;
        options.emitWarning = !isProd;
        return options;
      });
  },

  pluginOptions: {
    apollo: {
      enableMocks: true,
      enableEngine: true,
      serverOptions: { schema },
    },
    ssr: {
      templatePath: path.resolve(__dirname, './dist/index.server.html'),
    },
  },
};
