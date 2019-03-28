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
                                   :tags.sync="filters.terms.tags"
                  />
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <div style="height: 400px;">
                  <transition name="fade-cover">
                    <div v-show="chart.loading" class="loading-cover" style="height: 400px; line-height: 400px;">
                      <div>Chart loading...<br><font-awesome-icon icon="circle-notch" size="5x" :transform="{ rotate: 120 }" spin/></div>
                    </div>
                  </transition>
                  <no-ssr>
                    <climate-chart @init="onChartInit" @filterLakes="updateLakes"/>
                  </no-ssr>
                </div>
              </b-col>
            </b-row>
          </b-form>
        </b-card>
      </b-col>
      <div class="d-block d-lg-none mt-4 w-100"/>
      <b-col cols="12" lg="6">
        <b-card header-tag="header" footer-tag="footer">
          <h1 slot="header">Map</h1>
          <b-container fluid class="card-text">
            <transition name="fade-cover">
              <div v-show="map.loading" class="loading-cover" style="height: 485px; line-height: 485px;">
                <div>Map loading...<br><font-awesome-icon icon="circle-notch" size="5x" spin/></div>
              </div>
            </transition>
            <div style="height: 485px;">
              <no-ssr>
                <vl-map :load-tiles-while-animating="true"
                        :load-tiles-while-interacting="true"
                        data-projection="EPSG:4326"
                        style="height: 485px"
                        @postrender="trySelectFeature"
                >
                  <vl-view :max-zoom="18" :zoom.sync="mapZoom" :center.sync="mapCenter" :rotation.sync="mapRotation"/>
                  <vl-feature v-for="result in mappedResults"
                              :id="result.id"
                              ref="features"
                              :key="result.id"
                              :properties="{ id: result.id, name: result.name, count: result.datasets }"
                  >
                    <vl-geom-point :coordinates="[result.longitude, result.latitude]"/>
                    <vl-style-box v-if="!!mapFeatures.find(f => f.id === result.id)" :z-index="3">
                      <vl-style-circle :radius="Math.max(4 * 1.5, mapZoom * 1.5)">
                        <vl-style-stroke :color="[255, 255, 255, 1]" :width="Math.max(1.5, mapZoom / 5)"/>
                        <vl-style-fill :color="[0, 235, 137, 1]"/>
                      </vl-style-circle>
                    </vl-style-box>
                    <vl-style-box v-else-if="result.datasets" :z-index="2">
                      <vl-style-circle :radius="Math.max(4, mapZoom * 1.2)">
                        <vl-style-stroke :color="[235, 235, 235, 1]" :width="Math.max(1, mapZoom / 6)"/>
                        <vl-style-fill :color="[0, 153, 255, 1]"/>
                      </vl-style-circle>
                    </vl-style-box>
                    <vl-style-box v-else :z-index="1">
                      <vl-style-circle :radius="Math.max(4, mapZoom * 1.2)">
                        <vl-style-stroke :color="[235, 235, 235, 1]" :width="Math.max(1, mapZoom / 6)"/>
                        <vl-style-fill :color="[175, 175, 175, 1]"/>
                      </vl-style-circle>
                    </vl-style-box>
                  </vl-feature>
                  <vl-interaction-select ref="interaction" :features.sync="mapFeatures">
                    <template slot-scope="select">
                      <!--vl-overlay :position="findPointOnSurface(feature.geometry)"-->
                      <vl-overlay v-for="feature in select['features']"
                                  :id="feature.id"
                                  :key="feature.id"
                                  class="feature-popup feature-popup-lake"
                                  :auto-pan="true"
                                  :position="[-90, -180]"
                      >
                        <template>
                          <b-card style="position: absolute; bottom: .5em; left: .5em; width: 256px">
                            <div slot="header">
                              <span style="float: left; font-size: 1rem; padding: 0 1rem 0 0; max-width: 200px;">
                                {{ feature.properties.name }}
                              </span>
                              <button type="button"
                                      class="close"
                                      aria-label="Close"
                                      style="font-size: 1.25rem"
                                      @click="mapFeatures = mapFeatures.filter(f => f.id !== feature.id)"
                              >
                                <span aria-hidden="true">&times;</span>
                              </button>
                            </div>
                            {{ (feature.properties.count || 'No') + ' dataset' + (feature.properties.count !== 1 ? 's' : '') }} available<br>
                            <router-link :to="{ name: 'databaseDetails', params: { id: feature.properties.id } }">
                              {{ feature.properties.count ? '&#8627; View details' : '&#8627; Show lake info' }}
                            </router-link>
                          </b-card>
                        </template>
                      </vl-overlay>
                    </template>
                  </vl-interaction-select>
                  <vl-layer-tile id="osm">
                    <vl-source-osm @mounted="onSourceOsmMounted"/>
                  </vl-layer-tile>
                </vl-map>
              </no-ssr>
            </div>
          </b-container>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="mt-4">
        <b-card style="overflow-x: auto;">
          <b-table hover
                   outlined
                   striped
                   caption-top
                   show-empty
                   sort-by="name"
                   :items="mappedResults"
                   :fields="fields"
          >
            <template slot="table-caption">Found lakes with datasets:</template>
            <template slot="countries" slot-scope="cell">
              <div class="text-monospace">
                {{ cell.item['countries'].map(c => c['code']).join(', ') }}
              </div>
            </template>
            <template slot="coordinates" slot-scope="cell">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="text-monospace" v-html="formatCoordinates(cell.item)"/>
            </template>
            <template slot="HEAD_datasets" slot-scope="cell">
              <div class="text-right">{{ cell.label }}</div>
            </template>
            <template slot="datasets" slot-scope="cell">
              <div class="text-monospace text-right">{{ cell.item.datasets }}</div>
            </template>
            <template slot="HEAD_actions" slot-scope="cell">
              <div class="text-center">{{ cell.label }}</div>
            </template>
            <template slot="actions" slot-scope="cell">
              <div class="text-center">
                <router-link :to="{ name: 'databaseDetails', params: { id: cell.item.id } }" title="View details">
                  <font-awesome-icon icon="external-link-alt" alt="View details"/>
                </router-link>
              </div>
            </template>
          </b-table>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import bTable from 'bootstrap-vue/es/components/table/table';
import FormInputTags from './FormInputTags';
import gql from 'graphql-tag';

const noSSR = {};

if (process.client) {
  const fallback = {
    template: `
      <div>
        <div class="alert alert-danger">
          <strong>Error:</strong> This component could not be loaded!
        </div>
      </div>`,
  };
  const ccLoad = import('./ClimateChart').catch(e => console.error(e));
  const vlLoad = import('vuelayers').catch(e => console.error(e));
  // noinspection JSUnusedGlobalSymbols
  Object.assign(noSSR, {
    climateChart: () => ccLoad.then(module => module.default),
    vlMap: () => vlLoad.then(module => module.Map['Map']).catch(() => fallback),
    vlView: () => vlLoad.then(module => module.Map['View']).catch(() => fallback),
    vlFeature: () => vlLoad.then(module => module.Feature['Feature']).catch(() => fallback),
    vlGeomPoint: () => vlLoad.then(module => module.PointGeom['Geom']).catch(() => fallback),
    vlInteractionSelect: () => vlLoad.then(module => module.SelectInteraction['Interaction']).catch(() => fallback),
    vlOverlay: () => vlLoad.then(module => module.Overlay['Overlay']).catch(() => fallback),
    vlLayerTile: () => vlLoad.then(module => module.TileLayer['Layer']).catch(() => fallback),
    vlSourceOsm: () => vlLoad.then(module => module.OsmSource['Source']).catch(() => fallback),
    vlStyleBox: () => vlLoad.then(module => module.StyleBox['Style']).catch(() => fallback),
    vlStyleFill: () => vlLoad.then(module => module.FillStyle['Style']).catch(() => fallback),
    vlStyleStroke: () => vlLoad.then(module => module.StrokeStyle['Style']).catch(() => fallback),
    vlStyleCircle: () => vlLoad.then(module => module.CircleStyle['Style']).catch(() => fallback),
  });
} else if (process.server) {
  // TODO: Figure out why computedItems throws an error during SSR
  // This dirty hack prevents an error from accessing this.$emit
  const tryComputedItems = bTable.computed.computedItems;
  bTable.computed.computedItems = function(...args) {
    try {
      return tryComputedItems.call(this, ...args);
    } catch (e) {
      return this.items;
    }
  };
}

export default {
  name: 'DatabaseViewIndex',
  components: {
    bTable,
    FormInputTags,
    ...noSSR,
  },
  data () {
    return {
      lakes: [],
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
                return !Array.isArray(this['proxies']) ? [] : this['proxies'].map(proxy => ({
                  text: proxy.name.slice(0, 1).toUpperCase() + proxy.name.slice(1),
                  name: proxy.name,
                  parent: 'proxy',
                }));
              },
            },
            {
              text: 'Attribute',
              icon: 'chart-area',
              name: 'attribute',
              isAvailable: () => !!this.filters.terms.tags.find(tag => {
                return tag.type === 'group' && tag.text === 'Proxy';
              }),
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
      chart: {
        loading: true,
      },
      map: {
        loading: true,
      },
      fields: [
        'name',
        { key: 'countries', label: 'Country' },
        'coordinates',
        'datasets',
        { key: 'actions', label: 'Details' },
      ],
    };
  },
  apollo: {
    lakes: {
      query: gql`
        query lakes {
          lakes: Lake(orderBy: "name_asc") {
            uuid
            name
            longitude
            latitude
            countries {
              uuid
              code
              name
            }
            cores {
              uuid
              label
              collections {
                uuid
                label
                file
                proxy {
                  uuid
                  name
                }
              }
            }
          }
        }
      `,
    },
  },
  computed: {
    mappedResults () {
      return this.lakes.map(lake => {
        let datasets = 0;
        lake.cores.forEach(core => core.collections.forEach(() => datasets++));
        return Object.assign({}, lake, { id: lake['uuid'], datasets });
      });
    },
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
    mapZoom: {
      get () { return this.$store.state.database.map.zoom; },
      set (value) { this.$store.commit('database/MAP_ZOOM_SET', value); },
    },
    mapCenter: {
      get () { return this.$store.state.database.map.center; },
      set (value) { this.$store.commit('database/MAP_CENTER_SET', value); },
    },
    mapRotation: {
      get () { return this.$store.state.database.map.rotation; },
      set (value) { this.$store.commit('database/MAP_ROTATION_SET', value); },
    },
    mapFeatures: {
      get () { return this.$store.state.database.map.features; },
      set (value) { this.$store.commit('database/MAP_FEATURES_SET', value); },
    },
  },
  methods: {
    ...mapActions('database', [
      'loadProxies',
      'loadProxyAttributes',
      'loadResultData',
    ]),
    onChartInit () {
      this.chart.loading = false;
    },
    // eslint-disable-next-line no-unused-vars
    updateLakes (filteredLakes) {
      //this.lakes = filteredLakes;
    },
    onSourceOsmMounted () {
      this.map.loading = false;
    },
    trySelectFeature () {
      // TODO: This gets executed far too often; Find a better trigger
      let selectedFeatures = this.$store.state.database.map.features;
      if (Array.isArray(selectedFeatures) && selectedFeatures.length) {
        if (Array.isArray(this.$refs.features)) {
          let feature = this.$refs.features.find(f => f.id === selectedFeatures[0].id);
          if (feature) {
            try {
              this.$refs.interaction.select(feature);
            } catch (e) {
              // do nothing
            }
          }
        }
      }
    },
    formatCoordinates({ latitude, longitude }) {
      latitude = Number.parseFloat(latitude);
      longitude = Number.parseFloat(longitude);
      latitude = latitude < 0 ? (-1 * latitude).toFixed(6) + '° S' : latitude.toFixed(6) + '° N';
      if (latitude.length < 12) {
        latitude = '&nbsp;' + latitude;
      }
      longitude = longitude < 0 ? (-1 * longitude).toFixed(6) + '° W' : longitude.toFixed(6) + '° E';
      if (longitude.length < 12) {
        longitude = '&nbsp;&nbsp;' + longitude;
      } else if (longitude.length < 13) {
        longitude = '&nbsp;' + longitude;
      }
      return [latitude, longitude].join(', ');
    },
  },
};
</script>

<style lang="scss" scoped>
  .feature-popup-lake {
    bottom: .5em;
    left: .5em;
  }
</style>
