const path = require('path');
const webpack = require('webpack');
const bundle = require('./package');

const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  process.env.DEBUG = 'neo4j-graphql-js';
}

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

  pluginOptions: {
    apollo: {
      lintGQL: true,
      enableMocks: false,
      enableEngine: true,
      cors: { origin: true, credentials: true },
      apolloServer: {
        introspection: true,
        plugins: [
          {
            /* The `requestDidStart` will be called when the request has started
               processing and more granular events — like `parsingDidStart` below —
               are executed when those particular events occur. */
            requestDidStart (requestContext) {
              /* Request-specific scope can be created here and
                 used in more granular lifecycle events below. */
              return {
                responseForOperation (innerContext) {
                  void innerContext;
                },
                executionDidStart (innerContext) {
                  void innerContext;
                },
                willSendResponse (innerContext) {
                  void innerContext;
                },
              };
            },
          },
        ],
      },
    },
    ssr: {
      entry: target => `./src/entry-${target}.js`,
      defaultTitle: 'nether-db',
      templatePath: path.resolve(__dirname, './dist/index.server.html'),
      extendServer: app => {
        const cookieParser = require('cookie-parser');
        app.use(cookieParser());
      },
      copyUrlOnStart: false,
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

  chainWebpack: config => {

    const htmlPlugin = config.plugins.get('html').store;

    config.plugins.delete('html-ssr');

    config.plugin('html')
      .tap(args => {
        Object.assign(args[0], {
          filename: 'index.client.html',
          template: path.resolve(__dirname, './templates/index.client.html'),
        });
        return args;
      });

    config.plugin('html-server').after('html')
      .use(htmlPlugin.get('plugin'), [{
        ...htmlPlugin.get('args')[0],
        filename: 'index.server.html',
        template: path.resolve(__dirname, './templates/index.server.html'),
      }]);

    if (isProd) {

      const { emailTemplateConfig, offlineTemplateConfig } = getParameters();

      config.plugin('html-email').after('html-server')
        .use(htmlPlugin.get('plugin'), [{
          ...htmlPlugin.get('args')[0],
          filename: 'index.email.html',
          template: path.resolve(__dirname, './templates/index.static.html'),
          templateParameters: (...args) => ({
            ...htmlPlugin.get('args')[0].templateParameters(...args),
            ...emailTemplateConfig,
          }),
          inject: false,
          minify: false,
        }]);

      config.plugin('html-offline').after('html-email')
        .use(htmlPlugin.get('plugin'), [{
          ...htmlPlugin.get('args')[0],
          filename: 'index.offline.html',
          template: path.resolve(__dirname, './templates/index.static.html'),
          templateParameters: (...args) => ({
            ...htmlPlugin.get('args')[0].templateParameters(...args),
            ...offlineTemplateConfig,
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
};

function getParameters () {
  const fs = require('fs');
  const logoFile = path.resolve(__dirname, './src/assets/varda-logo.svg');
  const logoSource = fs.readFileSync(logoFile, 'utf8');
  const offlineInfoFile = path.resolve(__dirname, './templates/index.offline.0.html');
  const offlineInfoSource = fs.readFileSync(offlineInfoFile, 'utf8');
  const defaultParams = {
    generator: {
      name: 'webpack',
      version: require('webpack/package').version,
    },
    logo: `<div role="img" aria-label="Logo">${logoSource}</div>`,
    credits: `${bundle.name} v${bundle.version}`,
  };

  return {
    emailTemplateConfig: {
      params: {
        ...defaultParams,
        title: '<%= email.subject %>',
        content: '<%= email.body %>',
      },
    },
    offlineTemplateConfig: {
      params: {
        ...defaultParams,
        title: 'Service Offline',
        content: offlineInfoSource,
      },
    },
  };
}
