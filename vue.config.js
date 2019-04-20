const path = require('path');
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  lintOnSave: true,

  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  indexPath: 'index.client.html',
  runtimeCompiler: false,

  css: {
    sourceMap: true,
  },

  devServer: {
    index: 'index.client.html',
  },

  pwa: {
    name: 'nether-db',
  },

  chainWebpack: config => {
    let templateParameters = () => {};
    config
      .plugin('html')
      .tap(([args]) => {
        args.filename = 'index.client.html';
        args.template = path.resolve(__dirname, './public/index.client.html');
        templateParameters = args.templateParameters;
        return [args];
      });
    config
      .plugin('html-ssr')
      .after('html')
      .use(require.resolve('html-webpack-plugin'), [{
        filename: 'index.server.html',
        template: path.resolve(__dirname, './public/index.server.html'),
        templateParameters,
      }]);
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .loader('eslint-loader')
      .tap(options => {
        options.emitError = isProd;
        options.emitWarning = !isProd;
        return options;
      });
    config.module
      .rule('csv')
      .test(/\.(csv)(\?.*)?$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]',
      });
    config.module
      .rule('scss')
      .oneOf('vue')
      .use('resolve-url-loader')
      .loader('resolve-url-loader')
      .options({
        keepQuery: false,
      })
      .before('sass-loader');
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.transformAssetUrls = Object.assign({}, options.transformAssetUrls, {
          'b-img': 'src',
          'b-img-lazy': ['src', 'blank-src'],
          'b-card': 'img-src',
          'b-card-img': 'img-src',
          'b-card-img-lazy': ['src', 'blank-src'],
          'b-carousel-slide': 'img-src',
          'b-embed': 'src',
        });
        return options;
      });
    config.resolve.alias
      .set('@seeds', path.resolve(__dirname, 'apollo-server/utils/neo4j-cli-service/seeds'));
  },

  pluginOptions: {
    apollo: {
      enableMocks: true,
      enableEngine: true,
      cors: { origin: true, credentials: true },
      serverOptions: { introspection: true },
    },
    ssr: {
      templatePath: path.resolve(__dirname, './dist/index.server.html'),
      extendServer: app => {
        const cookieParser = require('cookie-parser');
        app.use(cookieParser());
      },
      nodeExternalsWhitelist: [
        /\.less$/,
        /\.(s)css$/,
        /\?vue&type=style/,
        /^@babel\/runtime-corejs2/,
        /^@johmun\/vue-tags-input/,
        /^bootstrap-vue/,
        /^joi/,
        /^regenerator-runtime/,
        /^(ol\/|vuelayers)/,
      ],
    },
  },
};
