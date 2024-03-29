import axios from '@/axios';

const USER_SET = 'USER_SET';
const USER_LOGOUT = 'USER_LOGOUT';

export const user = {
  namespaced: true,
  state () {
    return {
      user: null,
    };
  },
  getters: {
    isAuthenticated (state) {
      return !!state.user;
    },
  },
  mutations: {
    [USER_SET] (state, user) {
      state.user = user;
    },
    [USER_LOGOUT] (state) {
      state.user = null;
    },
  },
  actions: {
    // eslint-disable-next-line no-unused-vars
    async doLogin ({ dispatch, commit, getters, rootGetters }, credentials) {
      try {
        const response = await axios.post('user/login', {
          name: credentials.name,
          password: credentials.password,
        });
        commit(USER_SET, response.data.user || null);
      } catch (err) {
        console.error(err);
      }
    },
    // eslint-disable-next-line no-unused-vars
    async doLogout ({ dispatch, commit, getters, rootGetters }, renderContext) {
      try {
        await axios.get('user/logout', { renderContext });
      } catch (err) {
        console.error(err);
      }
      commit(USER_LOGOUT);
    },
    // eslint-disable-next-line no-unused-vars
    async doRefresh ({ dispatch, commit, getters, rootGetters }, renderContext) {
      try {
        const response = await axios.get('user/refresh', { renderContext });
        commit(USER_SET, response.data.user || null);
      } catch (err) {
        console.error(err);
      }
    },
  },
};
