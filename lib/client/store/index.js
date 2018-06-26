import Vue from 'vue';
import Vuex from 'vuex';

import { user } from './user';

Vue.use(Vuex);

const isProd = process.env.NODE_ENV === 'production';

export function createStore () {
  return new Vuex.Store({
    modules: {
      user,
    },
    strict: !isProd,
  });
}
