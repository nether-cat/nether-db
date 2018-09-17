import axios from '../axios';

const PROXIES_SET = 'PROXIES_SET';
const PROXY_SET_ATTRIBUTES = 'PROXY_SET_ATTRIBUTES';

const RESULTS_SET = 'RESULTS_SET';

const DETAILS_ID_SET = 'DETAILS_ID_SET';

const MAP_ZOOM_SET = 'MAP_ZOOM_SET';
const MAP_CENTER_SET = 'MAP_CENTER_SET';
const MAP_ROTATION_SET = 'MAP_ROTATION_SET';
const MAP_FEATURES_SET = 'MAP_FEATURES_SET';

export const database = {
  namespaced: true,
  state () {
    return {
      proxies: [],
      results: undefined,
      detailsId: undefined,
      map: {
        zoom: 1,
        center: [0, 10],
        rotation: 0,
        features: [],
      },
    };
  },
  getters: {
    countProxies (state) {
      return Array.isArray(state.proxies) ? state.proxies.length : 0;
    },
    transformedResults (state) {
      if (state.results && Array.isArray(state.results['lakes'])) {
        return state.results['lakes']
          .map(lake => ({
            id: lake.identity,
            ...lake.properties,
          }));
      } else {
        return [];
      }
    },
    reducedResults (state) {
      let results, requestedId = Number(state.detailsId);
      try {
        let lake = state.results['lakes'].find(l => l.identity === requestedId);
        results = lake;
      } catch (e) {
        console.error(e);
        results = undefined;
      }
      return results;
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
    [DETAILS_ID_SET] (state, detailsId) {
      detailsId = Number(detailsId);
      state.detailsId = detailsId || undefined;
    },
    [MAP_ZOOM_SET] (state, zoom) {
      state.map.zoom = zoom;
    },
    [MAP_CENTER_SET] (state, center) {
      state.map.center = center;
    },
    [MAP_ROTATION_SET] (state, rotation) {
      state.map.rotation = rotation;
    },
    [MAP_FEATURES_SET] (state, features) {
      state.map.features = features;
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
