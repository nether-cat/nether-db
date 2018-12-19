import axios from '../axios';

const PROXIES_SET = 'PROXIES_SET';
const PROXY_SET_ATTRIBUTES = 'PROXY_SET_ATTRIBUTES';

const RESULTS_SET = 'RESULTS_SET';

const DETAILS_ID_SET = 'DETAILS_ID_SET';

const RECORDS_SET = 'RECORDS_SET';

const MAP_ZOOM_SET = 'MAP_ZOOM_SET';
const MAP_CENTER_SET = 'MAP_CENTER_SET';
const MAP_ROTATION_SET = 'MAP_ROTATION_SET';
const MAP_FEATURES_SET = 'MAP_FEATURES_SET';

export const database = {
  namespaced: true,
  state () {
    return {
      proxies: [],
      results: null,
      detailsId: null,
      records: null,
      map: {
        zoom: 1,
        center: [0, 10],
        rotation: 0,
        features: [],
      },
    };
  },
  getters: {
    countProxies: (state) => {
      return Array.isArray(state.proxies) ? state.proxies.length : 0;
    },
    transformedResults: (state) => {
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
    reducedResults: (state) => {
      let results, requestedId = Number(state.detailsId);
      try {
        let lake = state.results['lakes'].find(r => r.identity === requestedId);
        let lake_country_rels = state.results['lake_country_rels'].filter(r => r.start === lake.identity);
        let countries = state.results['countries'].filter(r => !!lake_country_rels.find(s => s.end === r.identity));
        let core_lake_rels = state.results['core_lake_rels'].filter(r => r.end === lake.identity);
        let cores = state.results['cores'].filter(r => !!core_lake_rels.find(s => s.start === r.identity));
        let collection_core_rels = state.results['collection_core_rels'].filter(r => !!cores.find(s => s.identity === r.end));
        let collections = state.results['collections'].filter(r => !!collection_core_rels.find(s => s.start === r.identity));
        let collection_attribute_rels = state.results['collection_attribute_rels'].filter(r => !!collections.find(s => s.identity === r.start));
        let attributes = state.results['attributes'].filter(r => !!collection_attribute_rels.find(s => s.end === r.identity));
        let collection_proxy_rels = state.results['collection_proxy_rels'].filter(r => !!collections.find(s => s.identity === r.start));
        let proxies = state.results['proxies'].filter(r => !!collection_proxy_rels.find(s => s.end === r.identity));
        let collection_publication_rels = state.results['collection_publication_rels'].filter(r => !!collections.find(s => s.identity === r.start));
        let publications = state.results['publications'].filter(r => !!collection_publication_rels.find(s => s.end === r.identity));
        results = {
          lake,
          lake_country_rels,
          countries,
          core_lake_rels,
          cores,
          collection_core_rels,
          collections,
          collection_attribute_rels,
          attributes,
          collection_proxy_rels,
          proxies,
          collection_publication_rels,
          publications,
        };
      } catch (e) {
        results = null;
      }
      return results;
    },
    lake: (state, getters) => {
      return getters.reducedResults && getters.reducedResults.lake ? {
        id: getters.reducedResults.lake.identity,
        ...getters.reducedResults.lake.properties,
      } : {};
    },
    countries: (state, getters) => {
      let countries = getters.reducedResults && getters.reducedResults.countries
        ? getters.reducedResults.countries : [];
      return countries.map(country => ({ id: country.identity, ...country.properties }));
    },
    collections: (state, getters) => {
      let collections = getters.reducedResults && getters.reducedResults.collections
        ? getters.reducedResults.collections : [];
      return collections.map(collection => ({
        id: collection.identity,
        ...collection.properties,
        year: getters.reducedResults.publications
          .find(r => r.identity === getters.reducedResults.collection_publication_rels
            .find(s => s.start === collection.identity).end).properties.year,
        type: getters.reducedResults.proxies
          .find(r => r.identity === getters.reducedResults.collection_proxy_rels
            .find(s => s.start === collection.identity).end).properties.name,
      }));
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
    [RECORDS_SET] (state, records) {
      state.records = records;
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
    async loadCollection({ dispatch, commit, getters, rootGetters }, collectionId, renderContext) {
      try {
        const response = await axios.get('search/collection/' + collectionId, { renderContext });
        commit(RECORDS_SET, response.data.records);
      } catch (err) {
        throw err;
      }
    },
  },
};
