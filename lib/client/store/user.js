const isProd = process.env.NODE_ENV === 'production';

import axios from '../axios';

import { User } from '../../common/store/models/user';

const USER_SET = 'USER_SET';
const USER_LOGOUT = 'USER_LOGOUT';

export const user = {
  namespaced: true,
  state: {
    user: null,
  },
  mutations: {
    [USER_SET] (state, user) {
      state.user = user;
    },
    [USER_LOGOUT] (state) {
      state.user = null;
    },
  },
  getters: {
    user (state) {
      return state.user;
    },
  },
  actions: {
    async doLogin ({ dispatch, commit, getters, rootGetters }, credentials) {
      try {
        const response = await axios.post('user/login', {
          name: credentials.name,
          password: credentials.password,
        });
        commit(USER_SET, response.data.user || null);
      } catch (err) {
        throw new Error(err);
      }
    },
    async doLogout ({ dispatch, commit, getters, rootGetters }) {
      try {
        const response = await axios.get('user/logout');
      } catch (err) {
        throw new Error(err);
      }
      commit(USER_LOGOUT);
    },
    async getStatus ({ dispatch, commit, getters, rootGetters }, renderContext) {
      try {
        // noinspection JSCheckFunctionSignatures
        const response = await axios.get('user/status', { renderContext });
        commit(USER_SET, response.data.user || null);
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
