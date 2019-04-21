<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12" lg="6">
        <b-card header-tag="header" footer-tag="footer">
          <h4 slot="header">Filter options</h4>
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
                    <climate-chart @init="$nextTick(() => chart.loading = false)" @filterLakes="updateLakes"/>
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
          <h4 slot="header">Map</h4>
          <b-container fluid class="card-text">
            <transition name="fade-cover">
              <div v-show="map.loading" class="loading-cover" style="height: 485px; line-height: 485px;">
                <div>Map loading...<br><font-awesome-icon icon="circle-notch" size="5x" spin/></div>
              </div>
            </transition>
            <div style="height: 485px;">
              <no-ssr>
                <map-overview :features="getFeatures" @loaded="$nextTick(() => map.loading = false)"/>
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
                   :items="getResults"
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
              <div class="text-monospace text-right">{{ cell.item.datasetsCount }}</div>
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
import { mapState, mapGetters } from 'vuex';
import FormInputTags from './FormInputTags';
import gql from 'graphql-tag';

const noSSR = {};

let lakeToFeature = (lake, index) => {
  return {
    type: 'Feature',
    id: lake['uuid'],
    geometry: {
      type: 'Point',
      coordinates: [lake['longitude'], lake['latitude']],
    },
    properties: {
      ...lake,
      index,
    },
  };
};

if (process.client) {
  const handleError = (err) => {
    console.error(err);
    return {
      template: `
      <div>
        <div class="alert alert-danger">
          <strong>Error:</strong> This component could not be loaded!
        </div>
      </div>`,
    };
  };
  Object.assign(noSSR, {
    'climate-chart': () => import('@/components/ClimateChart').then(m => m.default).catch(handleError),
    'map-overview': () => import('@/components/MapOverview').then(m => m.default).catch(handleError),
  });
}

export default {
  name: 'database-view-index',
  components: {
    ...noSSR,
    FormInputTags,
  },
  data () {
    return {
      lakes: [],
      filters: {
        terms: {
          tags: [],
          groups: [],
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
              datasets {
                uuid
                label
                file
                category {
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
    getResults () {
      return this.lakes.map(lake => {
        let datasetsCount = 0;
        lake.cores.forEach(core => core.datasets.forEach(() => datasetsCount++));
        return Object.assign({}, lake, { id: lake['uuid'], datasetsCount });
      });
    },
    getFeatures () {
      return this.getResults.map(lakeToFeature);
    },
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
    // eslint-disable-next-line no-unused-vars
    updateLakes (filteredLakes) {
      // this.lakes = filteredLakes;
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
