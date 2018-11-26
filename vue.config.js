const path = require('path');

module.exports = {
  lintOnSave: 'error',

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
    /* eslint-disable indent */
    let templateParameters = () => {};
    config
      .plugin('html')
        .tap(([args]) => {
          args.filename = 'index.client.html';
          args.template = path.resolve(__dirname, './public/index.client.html');
          templateParameters = args.templateParameters;
          return [args];
        })
        .end()
      .plugin('html-ssr')
        .after('html')
        .use(require.resolve('html-webpack-plugin'), [{
          filename: 'index.server.html',
          template: path.resolve(__dirname, './public/index.server.html'),
          templateParameters,
        }])
        .end();
    /* eslint-enable indent */
  },

  pluginOptions: {
    apollo: {
      enableMocks: true,
      enableEngine: true,
    },
    ssr: {
      templatePath: path.resolve(__dirname, './dist/index.server.html'),
    },
  },
};
