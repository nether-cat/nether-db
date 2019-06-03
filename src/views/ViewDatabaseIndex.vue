<template>
  <BContainer fluid>
    <BRow>
      <BCol cols="12" lg="6">
        <BCard header-tag="header" footer-tag="footer">
          <h4 slot="header">Filter options</h4>
          <BForm v-observe-visibility="toggleJumpButton" class="card-text container-fluid">
            <BRow>
              <BCol>
                <BFormGroup label="Search terms:">
                  <BFormInput id="termsInput"
                              ref="terms"
                              :disabled="false"
                              type="text"
                              required
                  />
                </BFormGroup>
              </BCol>
            </BRow>
            <BRow>
              <BCol>
                <div class="rounded overflow-hidden" style="height: 400px;">
                  <Transition name="fade-opacity">
                    <div v-show="chart.loading"
                         class="loading-cover rounded overflow-hidden"
                         style="height: 400px; line-height: 400px;"
                    >
                      <div>
                        Chart loading...<br>
                        <FontAwesomeIcon icon="circle-notch" size="5x" :transform="{ rotate: 120 }" spin/>
                      </div>
                    </div>
                  </Transition>
                  <SkipServerSide>
                    <ChartClimate
                      @init="(flush) => { chart.flush = flush; $nextTick(() => chart.loading = false); }"
                      @domain="(domain) => chart.active && !chart.loading && (chart.domain = domain)"
                      @filterLakes="updateLakes"
                    />
                  </SkipServerSide>
                </div>
              </BCol>
            </BRow>
          </BForm>
        </BCard>
      </BCol>
      <div class="d-block d-lg-none mt-4 w-100"/>
      <BCol cols="12" lg="6">
        <BCard header-tag="header" footer-tag="footer">
          <h4 slot="header">Map</h4>
          <BContainer fluid class="card-text rounded overflow-hidden">
            <Transition name="fade-opacity">
              <div v-show="map.loading"
                   class="loading-cover rounded overflow-hidden"
                   style="height: 485px; line-height: 485px;"
              >
                <div>
                  Map loading...<br>
                  <FontAwesomeIcon icon="circle-notch" size="5x" spin/>
                </div>
              </div>
            </Transition>
            <div style="height: 485px;">
              <SkipServerSide>
                <MapOverview :features="getFeatures" @loaded="$nextTick(() => map.loading = false)"/>
              </SkipServerSide>
            </div>
          </BContainer>
        </BCard>
      </BCol>
    </BRow>
    <BRow>
      <BCol class="mt-4">
        <BCard style="overflow-x: auto;">
          <BTable hover
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
                <RouterLink :to="{ name: 'databaseDetails', params: { lakeId: cell.item.id } }" title="View details">
                  <FontAwesomeIcon icon="external-link-alt" alt="View details"/>
                </RouterLink>
              </div>
            </template>
          </BTable>
        </BCard>
      </BCol>
    </BRow>
    <Transition name="fade-opacity">
      <div v-if="showJumpButton" class="btn-overlay">
        <BButton v-scroll-to="{ el: 'body', force: false, ...scrollEvents }" variant="link">
          <FontAwesomeIcon :icon="['far', 'arrow-alt-circle-up']" size="5x"/>
        </BButton>
      </div>
    </Transition>
  </BContainer>
</template>

<script>
import { log } from '@/plugins';

const SkipSSR = {};

let lakeToFeature = (lake, index) => {
  return {
    type: 'Feature',
    id: lake['uuid'],
    geometry: {
      type: 'Point',
      coordinates: [lake.longitude, lake.latitude],
    },
    properties: {
      ...lake,
      index,
      coordinates: [lake.longitude, lake.latitude],
    },
  };
};

if (!process.env.VUE_SSR) {
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
  Object.assign(SkipSSR, {
    'ChartClimate': () => import('@/components/ChartClimate').then(m => m.default).catch(handleError),
    'MapOverview': () => import('@/components/MapOverview').then(m => m.default).catch(handleError),
  });
}

export default {
  name: 'ViewDatabaseIndex',
  components: {
    ...SkipSSR,
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
        domain: undefined,
        flush: () => {},
        active: true,
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
      showJumpButton: false,
      scrollEvents: {
        onStart: () => (this.showJumpButton = false),
        onCancel: () => (this.showJumpButton = true),
      },
    };
  },
  apollo: {
    lakes: {
      prefetch: false,
      query: ESLint$1.gql`
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
      error (err) {
        log([err.message], 'Query', 2);
        return false;
      },
    },
  },
  computed: {
    getResults () {
      return (this.lakes || []).map(lake => {
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
  activated () {
    /* FIXME: This is a dirty hack, but when this component has been inactive
              too long, the c3 component starts acting weird without this.
    */
    this.chart.flush(this.chart.domain);
    this.chart.active = true;
  },
  deactivated () {
    this.chart.active = false;
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
    toggleJumpButton (disable = true) {
      this.showJumpButton = !disable;
    },
  },
};
</script>