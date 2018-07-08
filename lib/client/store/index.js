import Vue from 'vue';
import Vuex from 'vuex';

import { user } from './user';

Vue.use(Vuex);

const isProd = process.env.NODE_ENV === 'production';

export function createStore () {
  let store = new Vuex.Store({
    modules: {
      user,
    },
    strict: !isProd,
  });
  if (module.hot) {
    // accept actions and mutations as hot modules
    module.hot.accept(['./user'], () => {
      console.info(
        "%c –– Accepting updated Vuex modules –– ",
        "background: #3eaf7c; color: floralwhite; text-shadow: purple 1px -1px 2px;"
      );
      // require and swap in the updated modules
      store.hotUpdate({
        modules: {
          user: require('./user').user,
        },
      });
    });
  }
  return store;
}
