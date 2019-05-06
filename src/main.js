import Vue from 'vue';
import App from './App';
import { installPlugins } from './plugins';
import { createRouter } from './router';
import { createStore } from './store';
import { createProvider } from './vue-apollo';
import { sync } from 'vuex-router-sync';
import SESSION from '@/graphql/Session.graphql';

Vue.config.productionTip = false;

Vue.use(installPlugins);

export async function createApp ({
  beforeProvider = () => {},
  beforeApp = () => {},
  afterApp = () => {},
} = {}) {
  const options = {
    ssr: false,
    httpLinkOptions: {
      credentials: 'include',
    },
    inMemoryCacheOptions: {
      dataIdFromObject: object => object['uuid'] || object['_id'] || null,
    },
  };

  await beforeProvider(options);

  const router = createRouter();
  const store = createStore();
  const apolloProvider = createProvider(options);

  sync(store, router);

  const checkSession = () => {
    return apolloProvider.defaultClient.query({
      query: SESSION,
      fetchPolicy: process.client ? 'cache-first' : 'network-only',
    });
  };

  router.beforeEach(async (to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      let { data } = await checkSession();
      if (!data || !data.session || data.session.state !== 'AUTHORIZED') {
        router.status = 403;
        next({
          name: 'login',
          query: { q: 'showInfo', redirect: to.fullPath },
        });
      } else {
        next();
      }
    } else if (to.matched.some(record => record.meta.requiresGuest)) {
      let { data } = await checkSession();
      if (!data || !data.session || data.session.state === 'AUTHORIZED') {
        router.status = 403;
        next('/');
      } else {
        next();
      }
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
