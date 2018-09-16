<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12" lg="6">
        <b-card header-tag="header" footer-tag="footer">
          <h1 slot="header">Filter options</h1>
          <b-form class="card-text container-fluid">
            <b-row>
              <b-col>
                <b-form-group label="Search terms:">
                  <form-input-tags :groups="filters.terms.groups"
                                   :tags.sync="filters.terms.tags"/>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-form-group label="Locations:">
                  <b-form-input type="text"
                                v-model="filters.location"
                                required
                                placeholder="Add coordinates, continents or countries"/>
                </b-form-group>
              </b-col>
            </b-row>
          </b-form>
        </b-card>
      </b-col>
      <div class="d-block d-lg-none mt-4 w-100"></div>
      <b-col cols="12" lg="6">
        <b-card header-tag="header" footer-tag="footer">
          <h1 slot="header">Map</h1>
          <b-container fluid class="card-text">
            <div style="height: 400px">
            <no-ssr>
              <b-progress variant="primary" animated class="mb-3" slot="placeholder">
                <b-progress-bar :value="100">Loading map...</b-progress-bar>
              </b-progress>
              <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326" style="height: 400px">
                <vl-view :zoom.sync="map.zoom" :center.sync="map.center" :rotation.sync="map.rotation"></vl-view>
                <vl-interaction-select :features.sync="map.selected">
                  <!--suppress HtmlUnknownAttribute -->
                  <template slot-scope="select">
                    <!--vl-overlay :position="findPointOnSurface(feature.geometry)"-->
                    <vl-overlay v-for="feature in select.features"
                                class="feature-popup feature-popup-lake"
                                :key="feature.id"
                                :id="feature.id"
                                :auto-pan="true"
                                :position="[-90, -180]">
                      <!--suppress HtmlUnknownAttribute -->
                      <template slot-scope="popup">
                        <b-card style="position: absolute; bottom: .5em; left: .5em; width: 200px">
                          <div slot="header">
                            <span style="float: left; font-size: 1rem; padding: 0 1rem .25rem 0">
                              {{ feature.properties.name }}
                            </span>
                            <button type="button" class="close" aria-label="Close" style="font-size: 1.25rem"
                                    @click="map.selected = map.selected.filter(f => f.id !== feature.id)">
                              <span aria-hidden="true">&times;</span>
                            </button>
                          </div>
                          Open details
                        </b-card>
                      </template>
                    </vl-overlay>
                  </template>
                </vl-interaction-select>
                <vl-layer-tile id="osm">
                  <vl-source-osm></vl-source-osm>
                </vl-layer-tile>
                <vl-feature v-for="result in transformedResults"
                            :result="result"
                            :key="result.id"
                            :properties="{ name: result.name }">
                  <vl-geom-point :coordinates="[result.longitude, result.latitude]"></vl-geom-point>
                </vl-feature>
              </vl-map>
            </no-ssr>
            </div>
          </b-container>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="mt-4">
        <b-card>
          <b-table hover outlined striped caption-top :items="transformedResults" :fields="fields">
            <template slot="table-caption">
              This is a table caption.
            </template>
          </b-table>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import * as CountryList from 'countries-list';
  import bTable from 'bootstrap-vue/es/components/table/table';
  import FormInputTags from './FormInputTags';

  const noSSR = {};

  let callFindPointOnSurface = undefined;

  let findPointOnSurface = (geom) => {
    if (callFindPointOnSurface) {
      return callFindPointOnSurface(geom);
    } else {
      console.error('Function "findPointOnSurface" was not loaded correctly!');
    }
  };

  if (process.env.VUE_ENV !== 'server') {
    const fallback = {
      template: `
      <div>
        <div class="alert alert-danger">
          <strong>Error:</strong> This component could not be loaded!
        </div>
      </div>`,
    };
    const vlLoad = import('vuelayers').catch(e => console.error(e));
    const vlLoadExt = import('vuelayers/lib/ol-ext').catch(e => console.error(e));
    vlLoadExt.then(module => callFindPointOnSurface = module.findPointOnSurface).catch(() => {});
    // noinspection JSUnusedGlobalSymbols
    Object.assign(noSSR, {
      vlMap: () => vlLoad.then(module => module.Map['Map']).catch(() => fallback),
      vlView: () => vlLoad.then(module => module.Map['View']).catch(() => fallback),
      vlInteractionSelect: () => vlLoad.then(module => module.SelectInteraction['Interaction']).catch(() => fallback),
      vlOverlay: () => vlLoad.then(module => module.Overlay['Overlay']).catch(() => fallback),
      vlLayerTile: () => vlLoad.then(module => module.TileLayer['Layer']).catch(() => fallback),
      vlSourceOsm: () => vlLoad.then(module => module.OsmSource['Source']).catch(() => fallback),
      vlFeature: () => vlLoad.then(module => module.Feature['Feature']).catch(() => fallback),
      vlGeomPoint: () => vlLoad.then(module => module.PointGeom['Geom']).catch(() => fallback),
    });
  }

  export default {
    name: 'TheDatabase',
    components: {
      bTable,
      FormInputTags,
      ...noSSR,
    },
    async prefetchData ({ store, route, renderContext }) {
      if (!store.getters['user/isAuthenticated']) {
        await store.dispatch('user/doRefresh', renderContext);
      }
      await store.dispatch('database/loadProxies', renderContext);
      await store.dispatch('database/loadResultData', renderContext);
    },
    data () {
      return {
        filters: {
          terms: {
            tags: [],
            groups: [
              {
                text: 'Proxy',
                icon: 'archive',
                name: 'proxy',
                isAvailable: () => true,
                fetchOptions: () => {
                  return !Array.isArray(this['proxies']) ? [] : this['proxies'].map(
                    proxy => ({
                      text: proxy.name.slice(0, 1).toUpperCase() + proxy.name.slice(1),
                      name: proxy.name,
                      parent: 'proxy',
                    })
                  );
                },
              },
              {
                text: 'Attribute',
                icon: 'chart-area',
                name: 'attribute',
                isAvailable: () => !!this.filters.terms.tags.find(
                  tag => tag.type === 'group' && tag.text === 'Proxy',
                ),
                fetchOptions: () => {
                  return this.filters.terms.tags
                    .filter(tag => tag.type === 'option' && tag.parent === 'proxy')
                    .reduce((items, tag) => {
                      if (Array.isArray(this['proxies'])) {
                        let proxy = this['proxies'].find(proxy => proxy.name === tag.name);
                        if (proxy) {
                          if (!proxy._attributes) {
                            this.loadProxyAttributes(proxy.id);
                          } else {
                            let attributes = proxy._attributes;
                            items.push(
                              ...attributes.map(
                                attribute => ({
                                  text: attribute.name + ' (' + tag.text + ')',
                                  name: attribute.name,
                                  parent: 'attribute',
                                }),
                              ),
                            );
                          }
                        }
                      }
                      return items;
                    }, []);
                },
              },
            ],
          },
          location: '',
        },
        map: {
          zoom: 1,
          center: [0, 20],
          rotation: 0,
          selected: [],
        },
        fields: [
          'name',
          'longitude',
          'latitude',
          'surface_level',
          'max_depth',
        ],
      };
    },
    computed: {
      ...mapState('user', [
        'user',
      ]),
      ...mapState('database', [
        'proxies',
        'results',
      ]),
      ...mapGetters('database', [
        'countProxies',
        'transformedResults',
      ]),
    },
    methods: {
      ...mapActions('database', [
        'loadProxies',
        'loadProxyAttributes',
        'loadResultData',
      ]),
      findPointOnSurface,
    },
  };
</script>

<style lang="scss" scoped>
  @import '~vuelayers/lib/style.css';

  .feature-popup-lake {
    bottom: .5em;
    left: .5em;
  }
</style>
