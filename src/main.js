import Vue from 'vue';
import App from './App';
import { installPlugins } from './plugins';
import { createRouter } from './router';
import { createStore } from './store';
import { createProvider } from './vue-apollo';
import { sync } from 'vuex-router-sync';
import typeDefs from '@/graphql/local-state/schema.graphql';
import SESSION from '@/graphql/queries/Session.graphql';

Vue.prototype.$log = (...args) => console.log(...args);

Vue.config.productionTip = false;

Vue.use(installPlugins);

export async function createApp ({
  beforeProvider = () => {},
  beforeApp = () => {},
  afterApp = () => {},
} = {}) {
  const options = {
    ssr: false,
    persisting: true,
    httpLinkOptions: {
      credentials: 'include',
    },
    inMemoryCacheOptions: {
      dataIdFromObject: object => object['uuid'] || object['_id'] || null,
    },
    typeDefs,
    resolvers: {
      Mutation: {
        toggleConnection: (root, args, { cache }) => {
          const query = ESLint$0.gql`
            query isConnected { 
              isConnected @client
            }
          `;
          const previous = cache.readQuery({ query });
          const data = {
            isConnected: !previous.isConnected,
          };
          cache.writeData({ data });
        },
      },
    },
    onCacheInit: cache => {
      const data = {
        isConnected: false,
      };
      cache.writeData({ data });
    },
  };

  await beforeProvider(options);

  const router = createRouter();
  const store = createStore();
  const apolloProvider = createProvider(options);

  sync(store, router);

  const checkSession = () => {
    return apolloProvider.defaultClient.query(Object.assign(
      { query: SESSION },
      { fetchPolicy: process.env.VUE_SSR ? 'network-only' : 'cache-first' },
    ));
  };

  router.beforeEach(async (to, from, next) => {
    let { meta: { beforeEachHook } } = to.matched.find(
      route => typeof route.meta.beforeEachHook === 'function',
    ) || { meta: {} };
    if (beforeEachHook) {
      let { data } = await checkSession();
      beforeEachHook({ data, router, from, to, next });
    } else {
      next();
    }
  });

  await beforeApp({
    router,
    store,
    apolloProvider,
  });

  const app = new Vue({
    router,
    store,
    apolloProvider,
    render: h => h(App),
  });

  const result = {
    app,
    router,
    store,
    apolloProvider,
  };

  await afterApp(result);

  return result;
};
