import { loadAsyncComponents } from '@akryum/vue-cli-plugin-ssr/client';
import './registerServiceWorker';

import { createApp } from './main';

import gql from 'graphql-tag';

export default createApp({
  async beforeApp ({
    router,
  }) {
    await loadAsyncComponents({ router });
  },

  afterApp ({
    app,
    store,
  }) {
    if (window['__INITIAL_STATE__']) {
      store.replaceState(window['__INITIAL_STATE__']);
    }
    // TODO: Consider to set up the router's beforeResolve hook and
    //       mount the app afterwards in the router's onReady hook
    app.$mount('#app');
    window['__VUE_APP__'] = app;
    window['__GRAPHQL_TAG__'] = gql;
  },
});
