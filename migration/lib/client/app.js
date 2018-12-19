import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import FontAwesome from '@fortawesome/fontawesome';
import Brands from '@fortawesome/fontawesome-free-brands';
import Regular from '@fortawesome/fontawesome-free-regular';
import Solid from '@fortawesome/fontawesome-free-solid';
import { installPlugins } from './plugins';
import { createRouter } from './router';
import { createStore } from './store';
import App from './components/App';

FontAwesome.library.add(Brands, Regular, Solid);

Vue.use(installPlugins);

export function createApp () {
  const router = createRouter();
  const store = createStore();
  sync(store, router);
  const app = new Vue({
    render: h => h(App),
    router,
    store,
  });
  return { app, router, store };
}
