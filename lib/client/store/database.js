import axios from '../axios';

const PROXIES_SET = 'PROXIES_SET';
const PROXY_SET_ATTRIBUTES = 'PROXY_SET_ATTRIBUTES';

const RESULTS_SET = 'RESULTS_SET';

export const database = {
  namespaced: true,
  state () {
    return {
      proxies: [],
      results: [],
    };
  },
  getters: {
    countProxies (state) {
      return Array.isArray(state.proxies) ? state.proxies.length : 0;
    },
    transformedResults (state) {
      return state.results.map(proxy => {
        // TODO: Transform the results for output in a bootstrap table
      });
    },
  },
  mutations: {
    [PROXIES_SET] (state, proxies) {
      state.proxies = proxies;
    },
    [PROXY_SET_ATTRIBUTES] (state, proxy) {
      state.proxies.find(p => p.id === proxy.id)._attributes = proxy._attributes;
    },
    [RESULTS_SET] (state, results) {
      state.results = results;
    },
  },
  actions: {
    async loadProxies ({ dispatch, commit, getters, rootGetters }, renderContext) {
      try {
        const response = await axios.get('proxy', { renderContext });
        commit(PROXIES_SET, response.data.proxies || []);
      } catch (err) {
        throw err;
      }
    },
    async loadProxyAttributes({ dispatch, commit, getters, rootGetters }, proxyId, renderContext) {
      try {
        const response = await axios.get('proxy/' + proxyId, { renderContext });
        commit(PROXY_SET_ATTRIBUTES, response.data.proxy);
      } catch (err) {
        throw err;
      }
    },
    async loadResultData({ dispatch, commit, getters, rootGetters }, renderContext) {
      try {
        const response = await axios.get('search', { renderContext });
        commit(RESULTS_SET, response.data.results);
      } catch (err) {
        throw err;
      }
    },
  },
};
