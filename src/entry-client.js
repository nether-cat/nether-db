import { loadAsyncComponents } from '@akryum/vue-cli-plugin-ssr/client';
import './registerServiceWorker';
import { createApp } from './main';

export default createApp({
  async beforeApp ({
    router,
  }) {
    await loadAsyncComponents({ router });
  },
  afterApp ({
    app,
    router,
    store,
  }) {
    if (window['__INITIAL_STATE__']) {
      store.replaceState(window['__INITIAL_STATE__']);
    }
    router.onReady(() => {
      app.$mount('#app');
    });
    window['__VUE_APP__'] = app;
  },
});
