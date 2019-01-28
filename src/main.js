import Vue from 'vue';
import App from './App';
import { installPlugins } from './plugins';
import { createRouter } from './router';
import { createStore } from './store';
import { createProvider } from './vue-apollo';
import { sync } from 'vuex-router-sync';

Vue.config.productionTip = false;

Vue.use(installPlugins);

export async function createApp ({
  modifyOptions = () => {},
  beforeApp = () => {},
  afterApp = () => {},
} = {}) {
  const router = createRouter();
  const store = createStore();
  sync(store, router);
  const providerOptions = {
    ssr: false,
    httpLinkOptions: {
      credentials: 'include',
    },
  };
  await modifyOptions({ providerOptions });
  const apolloProvider = createProvider(providerOptions);

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
