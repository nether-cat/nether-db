const path = require('path');
const webpack = require('webpack');
const bundle = require('./package.json');

const isProd = process.env.NODE_ENV === 'production';

const htmlWebpackPlugin = {};
const templateParametersEmail = {};
const templateParametersOffline = {};

module.exports = {
  lintOnSave: true,

  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  indexPath: 'index.client.html',
  runtimeCompiler: false,

  css: {
    sourceMap: !isProd,
  },

  devServer: {
    index: 'index.client.html',
  },

  pwa: {
    name: bundle.name,
    assetsVersion: bundle.version,
    appleMobileWebAppCapable: 'yes',
  },

  chainWebpack: config => {

    config.plugin('html')
      .tap(([args]) => [{
        ...Object.assign(htmlWebpackPlugin, args),
        filename: 'index.client.html',
        template: path.resolve(__dirname, './templates/index.client.html'),
      }]);

    config.plugin('html-server').after('html')
      .use(require.resolve('html-webpack-plugin'), [{
        ...htmlWebpackPlugin,
        filename: 'index.server.html',
        template: path.resolve(__dirname, './templates/index.server.html'),
      }]);

    if (isProd) {

      extendParameters();

      config.plugin('html-email').after('html-server')
        .use(require.resolve('html-webpack-plugin'), [{
          ...htmlWebpackPlugin,
          filename: 'index.email.html',
          template: path.resolve(__dirname, './templates/index.static.html'),
          templateParameters: (...args) => ({
            ...htmlWebpackPlugin.templateParameters(...args),
            ...templateParametersEmail,
          }),
          inject: false,
          minify: false,
        }]);

      config.plugin('html-offline').after('html-email')
        .use(require.resolve('html-webpack-plugin'), [{
          ...htmlWebpackPlugin,
          filename: 'index.offline.html',
          template: path.resolve(__dirname, './templates/index.static.html'),
          templateParameters: (...args) => ({
            ...htmlWebpackPlugin.templateParameters(...args),
            ...templateParametersOffline,
          }),
        }]);

    }

    config.plugin('define')
      .tap(([args]) => [Object.assign({}, args, {
        'process.env': {
          ...args['process.env'],
          'BUNDLE_NAME': JSON.stringify(bundle.name),
          'BUNDLE_VERSION': JSON.stringify(bundle.version),
          'VUE_SSR': JSON.stringify(
            args['process.server'] && !args['process.client'],
          ),
        },
      })]);

    config.plugin('provide').after('define')
      .use(webpack.ProvidePlugin, [{
        'ESLint$0.gql': 'graphql-tag',
        'ESLint$1.gql': 'graphql-tag',
      }]);

    config.module.rule('eslint')
      .use('eslint-loader')
      .loader('eslint-loader')
      .tap(options => Object.assign({}, options, {
        emitError: isProd,
        emitWarning: !isProd,
      }));

    config.module.rule('csv')
      .test(/\.(csv)(\?.*)?$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]',
      });

    config.module.rule('scss')
      .oneOf('vue')
      .use('resolve-url-loader')
      .loader('resolve-url-loader')
      .options({
        keepQuery: false,
      })
      .before('sass-loader');

    config.module.rule('vue')
      .use('vue-loader')
      .tap(options => Object.assign({}, options, {
        transformAssetUrls: {
          ...options.transformAssetUrls,
          'object': 'data',
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
        },
      }));

    config.resolve.alias
      .set('@seeds', (
        path.resolve(__dirname, './apollo-server/utils/neo4j-cli-service/seeds')
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

function extendParameters () {
  const fs = require('fs');
  const logoFile = path.resolve(__dirname, './src/assets/varda-logo.svg');
  const logoSource = fs.readFileSync(logoFile, 'utf8');
  const offlineInfoFile = path.resolve(__dirname, './templates/index.offline.0.html');
  const offlineInfoSource = fs.readFileSync(offlineInfoFile, 'utf8');

  Object.assign(templateParametersEmail, {
    params: {
      generator: {
        name: 'webpack',
        version: require('webpack/package').version,
      },
      logo: `<div role="img" aria-label="Logo">${logoSource}</div>`,
      credits: `${bundle.name} v${bundle.version}`,
      title: '<%= email.subject %>',
      content: '<%= email.body %>',
    },
  });

  Object.assign(templateParametersOffline, {
    params: {
      ...templateParametersEmail.params,
      title: 'Scheduled Downtime',
      content: offlineInfoSource,
    },
  });
}
