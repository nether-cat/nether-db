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
      console.log(
        `%c vuex-store %c Accepting updated modules %c`,
        'background: #35495e; padding: 1px; border-radius: 3px 0 0 3px;  color: white',
        'background: #41b883; padding: 1px; border-radius: 0 3px 3px 0;  color: white',
        'background: transparent'
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
