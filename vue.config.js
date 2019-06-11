const path = require('path');
const webpack = require('webpack');
const bundle = require('./package.json');
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
    name: bundle.name,
    assetsVersion: bundle.version,
  },

  chainWebpack: config => {
    let htmlPluginArgs;
    config
      .plugin('html')
      .tap(([args]) => {
        htmlPluginArgs = args;
        args.filename = 'index.client.html';
        args.template = path.resolve(__dirname, './public/index.client.html');
        return [args];
      });
    config
      .plugin('html-ssr')
      .after('html')
      .use(require.resolve('html-webpack-plugin'), [{
        ...htmlPluginArgs,
        filename: 'index.server.html',
        template: path.resolve(__dirname, './public/index.server.html'),
      }]);
    config
      .plugin('define')
      .tap(([args]) => {
        args['process.env'].BUNDLE_NAME = JSON.stringify(bundle.name);
        args['process.env'].BUNDLE_VERSION = JSON.stringify(bundle.version);
        args['process.env'].VUE_SSR = JSON.stringify(
          args['process.server'] && !args['process.client'],
        );
        return [args];
      });
    config
      .plugin('provide')
      .after('define')
      .use(webpack.ProvidePlugin, [{
        'ESLint$0.gql': 'graphql-tag',
        'ESLint$1.gql': 'graphql-tag',
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
        options.transformAssetUrls = {
          ...options.transformAssetUrls,
          'b-img': 'src',
          'b-img-lazy': ['src', 'blank-src'],
          'b-card': 'img-src',
          'b-card-img': 'img-src',
          'b-card-img-lazy': ['src', 'blank-src'],
          'b-carousel-slide': 'img-src',
          'b-embed': 'src',
          'BImg': 'src',
          'BImgLazy': ['src', 'blank-src'],
          'BCard': 'img-src',
          'BCardImg': 'img-src',
          'BCardImgLazy': ['src', 'blank-src'],
          'BCarouselSlide': 'img-src',
          'BEmbed': 'src',
        };
        return options;
      });
    config.resolve.alias
      .set('@seeds', (
        path.resolve(__dirname, 'apollo-server/utils/neo4j-cli-service/seeds')
      ));
  },

  pluginOptions: {
    apollo: {
      enableMocks: false,
      enableEngine: true,
      cors: { origin: true, credentials: true },
      serverOptions: { introspection: true },
    },
    ssr: {
      entry: target => `./src/entry-${target}.js`,
      defaultTitle: 'nether-db',
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
        /^@fortawesome\/vue-fontawesome/,
        /^bootstrap-vue/,
        /^regenerator-runtime/,
        /^(ol\/|vuelayers)/,
      ],
    },
  },
};
