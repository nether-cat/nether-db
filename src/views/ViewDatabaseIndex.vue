<template>
  <BContainer fluid>
    <BRow>
      <BCol cols="12" lg="6">
        <BCard header-tag="header" footer-tag="footer">
          <h4 slot="header">Filters <span class="text-muted float-right">({{ filteredLakes.length }} results)</span></h4>
          <BForm class="card-text container-fluid form-container" @submit.prevent.stop>
            <BRow>
              <BCol>
                <FormFilters :source="getLakes" :result.sync="filteredLakes" :use="filters"/>
                <hr>
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
                      :events="getEvents"
                      @init="(flush) => { chart.flush = flush; $nextTick(() => chart.loading = false); }"
                      @selectDomain="selectDomain"
                      @selectEvent="selectEvent"
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
                <MapOverview :features="map.features" @loaded="$nextTick(() => map.loading = false)"/>
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
                  :items="filteredLakes"
                  :fields="fields"
          >
            <template slot="table-caption">
              {{
                filteredLakes.length && filteredLakes.length !== getLakes.length
                  ? 'Lakes matching your criteria:'
                  : 'All lakes currently in the database:'
              }}
            </template>
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
                <RouterLink :to="{ name: 'databaseDetails', params: { lakeId: cell.item.uuid } }" title="View details">
                  <FontAwesomeIcon icon="external-link-alt" alt="View details"/>
                </RouterLink>
              </div>
            </template>
          </BTable>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
import { log } from '@/plugins';
import {
  FFCountryFilter,
} from '@/components/FormFiltersLibrary';
import FormFilters from '@/components/FormFilters';
import GET_EVENTS from '@/graphql/queries/GetEvents.graphql';
import GET_LAKES from '@/graphql/queries/GetLakes.graphql';

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
    FormFilters,
  },
  data () {
    return {
      events: [],
      lakes: [],
      filters: [FFCountryFilter.factory(this)],
      filteredLakes: [],
      chart: {
        domain: undefined,
        flush: () => {},
        loading: true,
      },
      map: {
        features: [],
        loading: true,
      },
      fields: [
        'name',
        { key: 'countries', label: 'Country' },
        'coordinates',
        'datasets',
        { key: 'actions', label: 'Details' },
      ],
      isDeactivated: false,
    };
  },
  apollo: {
    events: {
      prefetch: false,
      query: GET_EVENTS,
      error (err) {
        log([err.message], 'Query', 2);
        return false;
      },
    },
    lakes: {
      prefetch: false,
      query: GET_LAKES,
      error (err) {
        log([err.message], 'Query', 2);
        return false;
      },
    },
  },
  computed: {
    getEvents () {
      return this.events.filter(e => e.lakes.length > 1);
    },
    getLakes () {
      return (this.lakes || []).map(lake => {
        let datasetsCount = 0;
        lake.cores.forEach(core => core.datasets.forEach(() => datasetsCount++));
        return Object.assign({}, lake, { datasetsCount });
      });
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
  watch: {
    async filteredLakes (newVal, oldVal) {
      let jobs = [], batchSize = 15;
      console.log('[APP] Started updating the map features...');
      let hiddenBefore = newVal.filter(lake => !oldVal.includes(lake));
      let hiddenNow = oldVal.filter(lake => !newVal.includes(lake));
      for (let i = 0; i < hiddenNow.length; i += batchSize) {
        let j = i + batchSize < hiddenNow.length ? i + batchSize : hiddenNow.length;
        let batch = hiddenNow.slice(i, i + batchSize);
        jobs.push(async () => {
          this.map.features = this.map.features.filter(f => !batch.find(l => f.id === l.uuid));
        });
      }
      hiddenBefore = hiddenBefore.filter(l => !this.map.features.find(f => l.uuid === f.id));
      for (let i = 0; i < hiddenBefore.length; i += batchSize) {
        let j = i + batchSize < hiddenBefore.length ? i + batchSize : hiddenBefore.length;
        let batch = hiddenBefore.slice(i, i + batchSize);
        jobs.push(async () => {
          this.map.features = this.map.features.concat(batch.map(lakeToFeature));
        });
      }
      let start, step = 0;
      let runSequence = (timestamp) => {
        if (!start) start = timestamp;
        let runtime = timestamp - start;
        if (jobs[step]) {
          jobs[step](); step++;
          requestAnimationFrame(runSequence);
        } else {
          console.log(`[APP] Updated the map features in ${runtime}ms`);
        }
      };
      requestAnimationFrame(runSequence);
    },
  },
  activated () {
    /* FIXME: This is a dirty hack, but when this component has been inactive
              too long, the c3 component starts acting weird without this.
    */
    this.chart.flush(this.chart.domain);
    this.isDeactivated = false;
  },
  deactivated () {
    this.isDeactivated = true;
  },
  methods: {
    selectDomain (domain) {
      return !this.isDeactivated && !this.chart.loading && (this.chart.domain = domain);
    },
    selectEvent (event) {
      console.log('Selected event', event);
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
