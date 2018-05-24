import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const isProd = process.env.NODE_ENV === 'production';

export function createStore () {
  return new Vuex.Store({
    state: {
      count: 0,
    },
    mutations: {
      increment (state) {
        state.count++;
      },
    },
    strict: !isProd,
  });
}
