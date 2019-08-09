<template>
  <BContainer fluid>
    <BRow>
      <BCol cols="12" lg="6">
        <BCard header-tag="header" footer-tag="footer">
          <h4 slot="header">Filters</h4>
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
                      :selection="getSelectedEvents"
                      @init="(flush) => { chart.flush = flush; $nextTick(() => chart.loading = false); }"
                      @selectDomain="selectDomain"
                      @selectEvent="selectEvent"
                      @unselectEvent="unselectEvent"
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
                  ? `${filteredLakes.length} sites that match your criteria:`
                  : `${filteredLakes.length} sites available in the database:`
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
  FFInputTag,
  FFDomainFilter,
  FFEventFilter,
  FFContinentFilter,
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
      filters: [
        FFDomainFilter.factory(this),
        FFEventFilter.factory(this),
        FFContinentFilter.factory(this),
        FFCountryFilter.factory(this),
      ],
      filteredLakes: [],
      chart: {
        domain: undefined,
        domainLimits: undefined,
        domainTimeout: undefined,
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
      let [, filter] = this.filters;
      return this.events.filter(
        e => e.lakes.length > 1 && e.lakes.some(l => filter.ui.data.find(d => d.uuid === l.uuid)),
      );
    },
    getSelectedEvents () {
      let [, filter] = this.filters, events;
      return events = filter.ui.tags.map(t => t.opts.params.value);
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
    'chart.domain': async function (newVal, oldVal) {
      if (this.chart.domainLimits === undefined) {
        this.chart.domainLimits = newVal;
        return;
      }
      let lowerDiff = Math.abs(newVal[0] - oldVal[0]),
          upperDiff = Math.abs(newVal[1] - oldVal[1]);
      if (lowerDiff > .5 || upperDiff > .5) {
        clearTimeout(this.chart.domainTimeout);
        this.chart.domainTimeout = setTimeout(() => {
          let [filter] = this.filters;
          let [tag] = filter.ui.tags;
          lowerDiff = Math.abs(newVal[0] - this.chart.domainLimits[0]);
          upperDiff = Math.abs(newVal[1] - this.chart.domainLimits[1]);
          if (lowerDiff < 1.3 && upperDiff < 1.3) {
            if (tag) {
              console.log('[APP] Removed filter for domain.');
              let tagIndex = filter.ui.tags.findIndex(t => t === tag);
              (tagIndex > -1) && filter.ui.tags.splice(tagIndex, 1);
              filter.refreshCache();
            }
          } else if (!tag) {
            console.log('[APP] Added filter for domain:', newVal);
            let newTag = FFInputTag.factory({
              label: '<em>Age within time span</em>',
              icon: 'history',
              value: newVal.map(v => v * 1000),
            });
            newTag.opts.remove = (resetDomain = true) => {
              console.log('[APP] Removed filter for domain.');
              this.chart.flush(this.chart.domainLimits);
              this.$nextTick(() => {
                let tagIndex = filter.ui.tags.findIndex(t => t === newTag);
                (tagIndex > -1) && filter.ui.tags.splice(tagIndex, 1);
                filter.refreshCache();
              });
            };
            filter.ui.tags.push(newTag);
            filter.refreshCache();
          } else {
            console.log('[APP] Modified filter for domain:', newVal);
            tag.opts.params.value = newVal.map(v => v * 1000);
            filter.refreshCache();
          }
        }, 250);
      }
    },
    async filteredLakes (newVal, oldVal) {
      let jobs = [], batchSize = 15;
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
        if (!start) {
          start = timestamp;
          console.log('[APP] Started updating the map features...');
        }
        let runtime = timestamp - start;
        if (jobs[step]) {
          jobs[step](); step++;
          requestAnimationFrame(runSequence);
        } else {
          console.log(`[APP] Updating the map features took ${runtime.toFixed(0)}ms`);
        }
      };
      setTimeout(() => requestAnimationFrame(runSequence), 250);
    },
  },
  activated () {
    /* FIXME: This is a dirty hack, but when this component has been inactive
              for too long, the c3 component starts acting weird without this.
    */
    this.chart.flush(this.chart.domain);
    this.isDeactivated = false;
  },
  deactivated () {
    this.isDeactivated = true;
  },
  methods: {
    selectDomain ([begin, end]) {
      !this.isDeactivated && !this.chart.loading && (this.chart.domain = [begin, end]);
    },
    selectEvent (event, next = () => {}) {
      let [, filter] = this.filters;
      if (filter.ui.tags.find(t => t.opts.params.value === event)) {
        return;
      }
      console.log('[APP] Added filter for event:', event);
      let newTag = FFInputTag.factory({ label: event.name, icon: 'layer-group', value: event });
      newTag.opts.remove = (unselectEvent = true) => {
        let tagIndex = filter.ui.tags.findIndex(t => t === newTag);
        (tagIndex > -1) && filter.ui.tags.splice(tagIndex, 1);
        (!!unselectEvent) && next();
        filter.refreshCache();
      };
      filter.ui.tags.push(newTag);
      filter.refreshCache();
    },
    unselectEvent (event) {
      console.log('[APP] Removed filter for event:', event);
      let [, filter] = this.filters, tag = filter.ui.tags.find(t => t.opts.params.value === event);
      (!!tag) && tag.opts.remove(false);
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
