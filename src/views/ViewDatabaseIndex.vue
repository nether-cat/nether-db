<template>
  <BContainer fluid>
    <BRow>
      <BCol cols="12" lg="6">
        <BCard class="h-100">
          <BForm class="card-text container-fluid form-container" @submit.prevent.stop>
            <BRow>
              <BCol>
                <FormFilters :source="lakes" :result.sync="filteredLakes" :use="filters" @resized="resizeMap"/>
                <hr>
              </BCol>
            </BRow>
            <BRow>
              <BCol>
                <div class="rounded overflow-hidden position-relative" style="height: 400px;">
                  <Transition name="fade-opacity">
                    <div v-show="chart.loading" class="loading-cover rounded overflow-hidden">
                      <span>
                        Chart loading...<br>
                        <FontAwesomeIcon icon="circle-notch" size="5x" :transform="{ rotate: 120 }" spin/>
                      </span>
                    </div>
                  </Transition>
                  <SkipServerSide>
                    <ChartClimate
                      :events="getEvents"
                      :selection="getSelectedEvents"
                      @loaded="registerChart"
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
        <BCard class="h-100">
          <BContainer fluid class="card-text rounded overflow-hidden position-relative h-100">
            <Transition name="fade-opacity">
              <div v-show="map.loading" class="loading-cover rounded overflow-hidden">
                <span>
                  Map loading...<br>
                  <FontAwesomeIcon icon="circle-notch" size="5x" spin/>
                </span>
              </div>
            </Transition>
            <div class="h-100">
              <SkipServerSide>
                <MapOverview :features="map.features" @loaded="registerMap"/>
              </SkipServerSide>
            </div>
          </BContainer>
        </BCard>
      </BCol>
    </BRow>
    <BRow>
      <BCol class="mt-4">
        <BCard class="overflow-auto">
          <BTable outlined
                  striped
                  responsive
                  caption-top
                  show-empty
                  sort-by="name"
                  :items="filteredLakes"
                  :fields="fields"
          >
            <template slot="table-caption">
              <span v-if="isInitialized">
                {{
                  filteredLakes.length && filteredLakes.length !== lakes.length
                    ? `${filteredLakes.length} sites that match your criteria:`
                    : `${filteredLakes.length} known sites in the database:`
                }}
              </span>
              <span v-else style="user-select: none">&nbsp;</span>
            </template>
            <template slot="empty" slot-scope="scope">
              <span>{{ scope.emptyText }}</span>
            </template>
            <template slot="[countries]" slot-scope="cell">
              <div class="text-monospace">
                {{ cell.item['countries'].map(c => c['code']).join(', ') }}
              </div>
            </template>
            <template slot="[coordinates]" slot-scope="cell">
              <div class="text-monospace"><pre>{{ cell.item | coordinates }}</pre></div>
            </template>
            <template slot="HEAD[datasets]" slot-scope="cell">
              <div class="text-right">{{ cell.label }}</div>
            </template>
            <template slot="[datasets]" slot-scope="cell">
              <div class="text-monospace text-right">{{ cell.item.datasetsCount }}</div>
            </template>
            <template slot="[actions]" slot-scope="cell">
              <div class="text-center">
                <BButton
                  size="sm"
                  variant="secondary"
                  :to="{ name: 'databaseDetails', params: { lakeId: cell.item.uuid } }"
                >
                  Details
                </BButton>
              </div>
            </template>
          </BTable>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
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
import GET_ENTITIES from '@/graphql/subscriptions/GetEntities.graphql';

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
        component: undefined,
        features: [],
        loading: true,
      },
      fields: [
        'name',
        { key: 'countries', label: 'Country' },
        'coordinates',
        'datasets',
        { key: 'actions', label: '' },
      ],
      isInitialized: false,
      isDeactivated: false,
    };
  },
  apollo: {
    events: {
      prefetch: false,
      query: GET_EVENTS,
    },
    lakes: {
      prefetch: false,
      query: GET_LAKES,
      watchLoading (isLoading, countModifier) {
        if (countModifier < 0) {
          this.isInitialized = true;
        }
      },
    },
    $subscribe: {
      entityUpdated: {
        query: GET_ENTITIES,
        variables () {
          return {
            types: ['Lake'],
          };
        },
        result ({ data }) {
          if (data && data.entityUpdated) {
            console.log('[APP] Received an update for entity:', data.entityUpdated.uuid);
          }
        },
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
            console.log('[APP] Added filter for age domain:', newVal);
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
            console.log('[APP] Modified filter for age domain:', newVal);
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
    this.chart.flush(this.chart.domain, true);
    this.isDeactivated = false;
  },
  deactivated () {
    this.isDeactivated = true;
  },
  methods: {
    registerChart (flush) {
      this.chart.flush = flush;
      this.$nextTick(() => this.chart.loading = false);
    },
    registerMap (outerComp) {
      (this.map.component = outerComp) && this.$nextTick(() => this.map.loading = false);
    },
    resizeMap () {
      let canvas = document.querySelector('.vl-map .ol-viewport canvas');
      let innerComp = this.map.component && this.map.component.$refs.mapComponent;
      if (canvas && innerComp) {
        requestAnimationFrame(() => {
          canvas.setAttribute('height', '0');
          innerComp.$map.updateSize();
        });
      }
    },
    selectDomain ([begin, end]) {
      !this.isDeactivated && !this.chart.loading && (this.chart.domain = [begin, end]);
    },
    selectEvent (event, next = () => {}) {
      let [, filter] = this.filters;
      if (filter.ui.tags.find(t => t.opts.params.value === event)) {
        return;
      }
      console.log('[APP] Added filter for tephra event:', event);
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
      console.log('[APP] Removed filter for tephra event:', event);
      let [, filter] = this.filters, tag = filter.ui.tags.find(t => t.opts.params.value === event);
      (!!tag) && tag.opts.remove(false);
    },
  },
};
</script>
