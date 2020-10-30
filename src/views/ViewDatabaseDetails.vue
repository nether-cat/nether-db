<template>
  <ApolloQuery
    class="container-fluid"
    :query="require('../graphql/queries/LookupLake.graphql')"
    :variables="{
      uuid: lakeId,
    }"
    :skip="!lakeId || isDeactivated"
    :notify-on-network-status-change="true"
    :update="data => data && data.lakes && data.lakes[0] || {}"
    @result="updateMapCenter"
  >
    <template v-slot:default="{ isLoading, result: { data: lake = { uuid: 0 }, loading, networkStatus, error } }">
      <BRow>
        <BCol cols="12" lg="6">
          <BCard class="h-100">
            <BContainer fluid class="card-text">
              <BRow>
                <BCol class="grid-format-data" :class="{ 'is-loading': networkStatus === network.loading }">
                  <h5 v-if="networkStatus === network.loading" class="font-weight-normal text-left">
                    <span class="loading-bar"><em>Unknown site</em></span>
                  </h5>
                  <h5 v-else class="font-weight-normal text-left">
                    <span v-if="lake.name">{{ lake.name }}</span>
                    <span v-else-if="lake.uuid"><em>Unnamed site</em></span>
                    <span v-else><em>Unknown site</em></span>
                    <span v-if="lake.countries" class="comma-separated text-muted">
                      (<span v-for="country in lake.countries" :key="country.code">{{ country.code }}</span>)
                    </span>
                  </h5>
                  <hr>
                  <BRow>
                    <BCol cols="5"><span class="loading-bar align-right">Latitude:</span></BCol>
                    <BCol cols="5">
                      <div class="loading-bar align-right connect right">
                        <pre>{{
                          Math.abs(lake.latitude) | formatNumber(5)
                        }}{{ ('number' === typeof lake.latitude ? '°' : '—') }}</pre>
                      </div>
                    </BCol>
                    <BCol>
                      <div class="loading-bar connect left">
                        <pre>{{ lake.latitude | formatUnit(0 > lake.latitude ? 'S' : 'N') }}</pre>
                      </div>
                    </BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5"><span class="loading-bar align-right">Longitude:</span></BCol>
                    <BCol cols="5">
                      <div class="loading-bar align-right connect right">
                        <pre>{{
                          Math.abs(lake.longitude) | formatNumber(5)
                        }}{{ ('number' === typeof lake.longitude ? '°' : '—') }}</pre>
                      </div>
                    </BCol>
                    <BCol>
                      <div class="loading-bar connect left">
                        <pre>{{ lake.longitude | formatUnit(0 > lake.longitude ? 'W' : 'E') }}</pre>
                      </div>
                    </BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5"><span class="loading-bar align-right">Surface elevation:</span></BCol>
                    <BCol cols="5">
                      <div class="loading-bar align-right connect right">
                        <pre>{{ lake.surfaceLevel | formatNumber }}</pre>
                      </div>
                    </BCol>
                    <BCol>
                      <div class="loading-bar connect left">
                        <pre>{{ lake.surfaceLevel | formatUnit('m') }}</pre>
                      </div>
                    </BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5"><span class="loading-bar align-right">Maximum depth:</span></BCol>
                    <BCol cols="5">
                      <div class="loading-bar align-right connect right">
                        <pre>{{ lake.maxDepth | formatNumber }}</pre>
                      </div>
                    </BCol>
                    <BCol>
                      <div class="loading-bar connect left">
                        <pre>{{ lake.maxDepth | formatUnit('m') }}</pre>
                      </div>
                    </BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5"><span class="loading-bar align-right">Surface area:</span></BCol>
                    <BCol cols="5">
                      <div class="loading-bar align-right connect right">
                        <pre>{{ lake.surfaceArea | formatNumber }}</pre>
                      </div>
                    </BCol>
                    <BCol>
                      <div class="loading-bar connect left">
                        <pre>{{ lake.surfaceArea | formatUnit('m²') }}</pre>
                      </div>
                    </BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5"><span class="loading-bar align-right">Water body volume:</span></BCol>
                    <BCol cols="5">
                      <div class="loading-bar align-right connect right">
                        <pre>{{ lake.waterBodyVolume | formatNumber }}</pre>
                      </div>
                    </BCol>
                    <BCol>
                      <div class="loading-bar connect left">
                        <pre>{{ lake.waterBodyVolume | formatUnit('m³') }}</pre>
                      </div>
                    </BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5"><span class="loading-bar align-right">Catchment area:</span></BCol>
                    <BCol cols="5">
                      <div class="loading-bar align-right connect right">
                        <pre>{{ lake.catchmentArea | formatNumber }}</pre>
                      </div>
                    </BCol>
                    <BCol>
                      <div class="loading-bar connect left">
                        <pre>{{ lake.catchmentArea | formatUnit('m²') }}</pre>
                      </div>
                    </BCol>
                  </BRow>
                  <hr>
                </BCol>
              </BRow>
            </BContainer>
          </BCard>
        </BCol>
        <div class="d-block d-lg-none mt-4 w-100"/>
        <BCol cols="12" lg="6">
          <BCard class="h-100">
            <BContainer fluid class="card-text rounded overflow-hidden position-relative h-100">
              <Transition name="fade-opacity">
                <div v-show="isInitializing" class="loading-cover rounded overflow-hidden">
                  <span>
                    Map loading...<br>
                    <FontAwesomeIcon icon="circle-notch" size="5x" spin/>
                  </span>
                </div>
              </Transition>
              <div class="h-100">
                <SkipServerSide>
                  <VlMap v-if="lake.uuid"
                         ref="mapComponent"
                         :load-tiles-while-animating="true"
                         :load-tiles-while-interacting="true"
                         data-projection="EPSG:4326"
                         @mounted="onMapMounted"
                  >
                    <VlView
                      :min-zoom="1"
                      :max-zoom="18"
                      :zoom="lake.initZoom || 10"
                      :center="mapCenter"
                      :rotation="0"
                      :constrain-rotation="false"
                    />
                    <VlFeature :id="lake.uuid" :properties="{ id: lake.uuid, name: lake.name }">
                      <VlGeomPoint :coordinates="[lake.longitude, lake.latitude]"/>
                      <VlStyleBox :z-index="1">
                        <VlStyleCircle :radius="6">
                          <VlStyleStroke :color="[255, 255, 255, 1]" :width="1.5"/>
                          <VlStyleFill :color="[0, 153, 255, 1]"/>
                        </VlStyleCircle>
                      </VlStyleBox>
                    </VlFeature>
                    <VlLayerTile id="osm">
                      <VlSourceOsm @mounted="isInitializing = false"/>
                    </VlLayerTile>
                  </VlMap>
                </SkipServerSide>
              </div>
            </BContainer>
          </BCard>
        </BCol>
        <BCol cols="12" class="mt-4">
          <BCard class="overflow-auto">
            <div class="table-header">
              <span class="table-caption text-muted">
                <span v-if="networkStatus !== network.loading">
                  <span v-if="datasetId && lake.datasetsCount">
                    Selected one dataset{{ lake.datasetsCount === 1 ? ':' : '' }}
                    <span v-if="lake.datasetsCount > 1">
                      <span class="d-none d-sm-inline">&mdash;&nbsp;</span>
                      <br class="d-sm-none">
                      <RouterLink :to="$route.path">{{ `(Show all ${lake.datasetsCount} datasets)` }}</RouterLink>
                    </span>
                  </span>
                  <span v-else>
                    {{ lake.datasetsCount || 'No' }}
                    {{ lake.datasetsCount === 1 ? 'dataset' : 'datasets' }}
                    available for this site:
                  </span>
                </span>
                <span v-else style="user-select: none">&nbsp;</span>
              </span>
            </div>
            <BTable hover
                    outlined
                    striped
                    responsive
                    caption-top
                    show-empty
                    sticky-header
                    class="table-main"
                    :class="{ 'table-toggle-details': true, 'may-toggle': !datasetId }"
                    :items="!lake.cores ? [] : [].concat(...lake.cores.map(core => core.datasets.map(d => (
                      { ...d, core, _showDetails: d.uuid === datasetId, _showMore: false }
                    )))).filter(d => !datasetId || d.uuid === datasetId)"
                    :fields="datasetsListFields"
                    @row-clicked="datasetsListClicked"
                    @mouseover.native="datasetsListFocus"
                    @mouseout.native="datasetsListBlur"
            >
              <template slot="empty" slot-scope="scope">
                <span>{{ scope.emptyText }}</span>
              </template>
              <template slot="row-details" slot-scope="{ item }">
                <div @click="datasetsListClicked(item)">
                  <div style="margin-left: .75rem; padding: .75rem 0; width: calc(100% - 1.5rem)">
                    <span class="d-inline-block pb-2 pr-3 text-nowrap"
                          :class="{ 'font-italic': !item.core.label }"
                          title="Sediment composite profile"
                    >
                      <FontAwesomeIcon icon="link"/>&ensp;{{ item.core.label || 'unnamed' }}
                    </span>
                    <span v-if="item.core.latitude && item.core.longitude"
                          class="d-inline-block pb-2 pr-3 text-nowrap"
                          title="Location"
                    >
                      <FontAwesomeIcon icon="map-pin"/>&ensp;{{ item.core | coordinates }}
                    </span>
                    <span v-if="item.core.coringMethod"
                          class="d-inline-block pb-2 pr-3 text-nowrap"
                          title="Coring method"
                    >
                      <FontAwesomeIcon icon="angle-double-up"/>&ensp;{{ item.core.coringMethod }}
                    </span>
                    <span v-if="item.core.drillDate"
                          class="d-inline-block pb-2 pr-3 text-nowrap"
                          title="Drill date"
                    >
                      <FontAwesomeIcon icon="clock"/>&ensp;{{ item.core.drillDate }} AD
                    </span>
                    <span v-if="item.core.waterDepth"
                          class="d-inline-block pb-2 pr-3 text-nowrap"
                          title="Water depth"
                    >
                      <FontAwesomeIcon icon="level-down-alt"/>&ensp;{{ item.core.waterDepth }} m
                    </span>
                    <span v-if="item.analysisMethod"
                          class="d-inline-block pb-2 pr-3 text-nowrap"
                          title="Analysis method"
                    >
                      <FontAwesomeIcon icon="microscope"/>&ensp;{{ item.analysisMethod }}
                    </span>
                    <span v-if="item.errorMean || item.errorMin && item.errorMax"
                          class="d-inline-block pb-2 pr-3 text-nowrap"
                          title="Uncertainty"
                    >
                      <FontAwesomeIcon icon="arrows-alt-v"/>&ensp;<span v-if="item.errorMean">
                        &plusmn;&thinsp;{{ item.errorMean.toFixed(2) }}&thinsp;&percnt;
                      </span><span v-else>
                        &minus;&thinsp;{{ item.errorMin.toFixed(2) }}&thinsp;&percnt;&hairsp;&comma;
                        &plus;&thinsp;{{ item.errorMax.toFixed(2) }}&thinsp;&percnt;
                      </span>
                    </span>
                    <span v-if="item.comments"
                          class="d-inline-block pb-2 pr-3 text-nowrap"
                          title="Comments"
                    >
                      <FontAwesomeIcon icon="comment-dots"/>&ensp;{{ item.comments }}
                    </span>
                    <span v-if="Object.values(item.extraProps || {}).some(v => ![null, undefined, 'auxiliary'].includes(v))"
                          title="Additional details"
                    >
                      <BButton
                        variant="link"
                        class="border-0 pb-2 pl-0 pr-2 font-italic text-nowrap text-dark"
                        @click.stop="datasetsListExtraClicked(item)"
                      ><FontAwesomeIcon :icon="['far', item._showMore ? 'minus-square' : 'plus-square']"/><span
                        class="pl-2"
                      >{{ item._showMore ? 'Show less' : 'Show more' }}</span></BButton>
                      <span v-if="item._showMore">
                        <span v-for="[key, value] in Object.entries(item.extraProps)
                                .filter(([, v]) => v !== null && v !== undefined)
                                .sort(([a], [b]) => a.localeCompare(b))"
                              :key="key"
                              class="pb-2 pr-3 text-nowrap"
                        ><span class="font-weight-light">{{ key | sentenceCase }}:</span>&nbsp;<span>{{ value }}</span></span>
                      </span>
                    </span>
                    <div v-if="item.publication && item.publication.length && item.publication[0].citation"
                         class="row m-0 flex-nowrap"
                    >
                      <span style="flex-shrink: 1; font-size: .875em;"
                            class="col-12 mt-2 mb-1 pb-2 px-0"
                            title="Reference"
                      >
                        <FontAwesomeIcon icon="quote-right" fixed-width/>
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <span class="mx-1" v-html="stripUrl(item.publication[0].citation)"/>
                        <span v-if="item.publication[0].doi && !item.publication[0].doi.match(/unpublished/i)">
                          <ExternalLink :href="`https://dx.doi.org/${item.publication[0].doi}`" @click.stop/>.
                        </span>
                        <span v-else class="text-nowrap text-secondary">[The respective DOI is not yet known]</span>
                      </span>
                      <span class="col-5 col-lg-6"/>
                    </div>
                    <span v-if="item.depthType === 'unknown' || [item.depthType, item.errorType].includes('auxiliary')"
                          style="font-size: .875rem"
                          class="d-block mt-1 pb-2 pr-3 text-nowrap"
                    >
                      <span title="Important note">
                        <FontAwesomeIcon icon="bullhorn"/>&ensp;<span style="font-weight: 500">Important note:&thinsp;</span>
                        {{ item.depthType === 'auxiliary' ? 'Auxiliary composite depth from cumulative varve thickness.' : '' }}
                        {{ item.depthType === 'unknown' ? 'Composite depth could not be reconstructed.' : '' }}
                        {{ item.errorType === 'auxiliary' ? 'Uncertainty recalculated from counting error.' : '' }}
                      </span>
                    </span>
                  </div>
                </div>
              </template>
              <template slot="[categories]" slot-scope="{ value }">
                {{ value | upperCaseFirst }}
              </template>
              <template slot="HEAD[ageInterval]">
                Ages&ensp;<span class="font-weight-lighter text-secondary">[a BP] in [<em>min</em>, <em>max</em>]</span>
              </template>
              <template slot="HEAD[samples]">
                Samples&ensp;<span class="font-weight-lighter text-secondary">[<em>count</em>]</span>
              </template>
              <template slot="HEAD[ageResolution]">
                Resolution&ensp;<span class="font-weight-lighter text-secondary">[samples / ka]</span>
              </template>
              <template slot="HEAD[publication]">
                Reference&ensp;<span class="font-weight-lighter text-secondary">[DOI]</span>
              </template>
              <template slot="[publication]" slot-scope="{ item, value: { doi, citation } }">
                <span v-if="doi && doi.match(/unpublished/i)"
                      v-b-tooltip.hover.bottom.viewport.html="{
                        customClass: 'tooltip-table-cell',
                        title: (citation || '').replace(
                          /(Available at:?)?\s?https?:\/\/.*doi\.org\/(.*?)\.?\s?$/i,
                          '<span class=\'d-inline-block mw-100 align-bottom text-truncate\'>doi:$2</span>',
                        )
                      }"
                      class="btn-link font-italic text-dark"
                >
                  <span>Not yet published</span><span
                    class="text-decoration-none d-inline-block"
                  >&nbsp;<FontAwesomeLayers class="ml-2">
                    <FontAwesomeIcon :icon="['far', 'circle']" transform="grow-3 left-1"/>
                    <FontAwesomeIcon icon="info" transform="shrink-5 left-1"/>
                  </FontAwesomeLayers></span>
                </span>
                <a v-else-if="doi"
                   v-b-tooltip.hover.bottom.viewport.html="{
                     customClass: 'tooltip-table-cell',
                     title: (citation || '').replace(
                       /(Available at:?)?\s?https?:\/\/.*doi\.org\/(.*?)\.?\s?$/i,
                       '<span class=\'d-inline-block mw-100 align-bottom text-truncate\'>doi:$2</span>',
                     )
                   }"
                   class="text-dark text-decoration-none text-nowrap"
                   title="Visit publication"
                   :href="`https://dx.doi.org/${doi}`"
                   target="_blank"
                >
                  <span class="text-decoration-hover">{{ doi }}</span>
                  <FontAwesomeIcon class="ml-2" icon="external-link-alt"/>
                </a>
                <span v-else>—</span>
              </template>
              <template slot="[actions]" slot-scope="{ item }">
                <div class="text-center">
                  <BButton
                    v-if="datasetId !== item.uuid"
                    size="sm"
                    variant="secondary"
                    :href="$router.resolve({ query: { datasetId: item.uuid } }).href"
                    @click.prevent="loadDataset"
                  >
                    Open
                  </BButton>
                  <BButton
                    v-else
                    size="sm"
                    variant="danger"
                    :to="$route.path"
                    replace
                  >
                    Close
                  </BButton>
                </div>
              </template>
            </BTable>
          </BCard>
        </BCol>
      </BRow>
      <ApolloQuery
        v-if="datasetId && lake && lake.uuid && lake.datasetsCount"
        :query="require('../graphql/queries/LookupDataset.graphql')"
        :variables="{
          uuid: datasetId,
          offset: 0,
        }"
        :tag="undefined"
        :throttle="300"
        :skip="!datasetId || isDeactivated || !lake.datasetsCount"
        :notify-on-network-status-change="true"
        @result="(res) => onIncomingResult(res)"
      >
        <template v-slot:default="{ query, isLoading, result: { data, loading, error } }">
          <BRow v-for="(dataset, num) in (data ? data.datasets : [])"
                :id="`recordsTable${ num ? '-' + num : '' }`"
                :key="dataset.uuid"
          >
            <BCol class="mt-4">
              <BCard class="overflow-auto">
                <div class="table-header">
                  <span class="table-caption text-muted">
                    <span>
                      {{ dataset.samples || 'No' }}
                      {{ dataset.samples === 1 ? 'sample' : 'samples' }}
                    </span>
                    <span>recorded in this dataset:</span>
                  </span>
                  <span class="table-actions">
                    <BButton
                      size="sm"
                      variant="outline-primary"
                      :disabled="exportStatus > codes.STATUS_OKAY"
                      @click="exportCSV(dataset)"
                    >
                      <FontAwesomeIcon v-if="exportStatus === codes.STATUS_LOAD" icon="spinner" fixed-width spin/>
                      <FontAwesomeIcon v-else-if="exportStatus === codes.STATUS_DONE" icon="check" fixed-width/>
                      <FontAwesomeIcon v-else icon="download" fixed-width/>
                      <span class="ml-1">CSV</span>
                    </BButton>
                  </span>
                </div>
                <BTable outlined
                        striped
                        responsive
                        caption-top
                        show-empty
                        sticky-header
                        sort-by="__rowNum__"
                        class="table-minor"
                        :items="dataset.records.map((r, i) => Object.assign({}, r, { __rowNum__: i }))"
                        :fields="getFields(dataset)"
                >
                  <template slot="[__rowNum__]" slot-scope="cell">
                    {{ cell.item.__rowNum__ + 1 }}
                  </template>
                  <template v-for="{ key } in getFields(dataset).slice(1)" :slot="`HEAD[${key}]`" slot-scope="{ label }">
                    <span :key="'HEAD_' + key">
                      {{ label | sentenceCase }}
                    </span>
                  </template>
                  <template v-for="{ key } in getFields(dataset).slice(1)" :slot="`[${key}]`" slot-scope="cell">
                    <span v-if="isInvalidValue(cell.item[key])" :key="key">
                      <i class="long-dash"/>
                    </span>
                    <span v-else :key="key">
                      {{ cell.item[key] }}
                    </span>
                  </template>
                  <template slot="bottom-row" slot-scope="{ columns }">
                    <td v-observe-visibility="shouldFetchMore ? {
                          callback: (isVisible, entry) => isVisible && fetchMore(query, dataset),
                          intersection: { threshold: 0.5 },
                          throttle: 300,
                        } : false"
                        role="cell"
                        aria-colindex="1"
                        :colspan="columns"
                    >
                      {{ '' }}
                    </td>
                  </template>
                </BTable>
              </BCard>
            </BCol>
          </BRow>
        </template>
      </ApolloQuery>
    </template>
  </ApolloQuery>
</template>

<script>
import debounce from 'lodash/debounce';
import { NetworkStatus } from 'apollo-client';

const SkipSSR = {};

let ScaleLine, ScaleLineLoad;

if (!process.env.VUE_SSR) {
  ScaleLineLoad = import('ol/control/ScaleLine')
    .then(module => ScaleLine = module.default)
    .catch(e => console.error(e));
  const fallback = {
    template: `
      <div>
        <div class="alert alert-danger">
          <strong>Error:</strong> This component could not be loaded!
        </div>
      </div>`,
  };
  const VueLayers = import('vuelayers').catch(e => console.error(e));
  Object.assign(SkipSSR, {
    VlMap: () => VueLayers.then(module => module.Map['Map']).catch(() => fallback),
    VlView: () => VueLayers.then(module => module.Map['View']).catch(() => fallback),
    VlFeature: () => VueLayers.then(module => module.Feature['Feature']).catch(() => fallback),
    VlGeomPoint: () => VueLayers.then(module => module.PointGeom['Geom']).catch(() => fallback),
    VlLayerTile: () => VueLayers.then(module => module.TileLayer['Layer']).catch(() => fallback),
    VlSourceOsm: () => VueLayers.then(module => module.OsmSource['Source']).catch(() => fallback),
    VlStyleBox: () => VueLayers.then(module => module.StyleBox['Style']).catch(() => fallback),
    VlStyleFill: () => VueLayers.then(module => module.FillStyle['Style']).catch(() => fallback),
    VlStyleStroke: () => VueLayers.then(module => module.StrokeStyle['Style']).catch(() => fallback),
    VlStyleCircle: () => VueLayers.then(module => module.CircleStyle['Style']).catch(() => fallback),
  });
}

const scrollDown = debounce((vm) => vm.$scrollTo('#recordsTable', 750, { offset: -58 }), 250);

const ExternalLink = {
  functional: true,
  render () {
    const [, { data, props }] = arguments;
    return <a class="text-dark" target="_blank" {...data}>{props.href}</a>;
  },
};

export default {
  name: 'ViewDatabaseDetails',
  components: {
    ...SkipSSR,
    ExternalLink,
  },
  filters: {
    formatNumber (value, length = 2) {
      return Number.parseFloat(value).toFixed(length)
        .replace('NaN', String('—').repeat(length));
    },
    formatUnit (value, unit = '', length = 2) {
      return 'number' === typeof value
        ? (unit ? ' ' + unit : '')
        : '—'.repeat(length);
    },
  },
  props: {
    lakeId: { type: String, default: undefined },
    datasetId: { type: String, default: undefined },
  },
  data () {
    return {
      currentLake: null,
      mapCenter: [0, 8],
      timesFetched: 0,
      exportStatus: 0,
      isDeactivated: false,
      isInitializing: true,
      shouldFetchMore: true,
      shouldScrollDown: false,
      datasetsListFields: [
        { key: 'categories', label: 'Subject', formatter: ([category]) => category && category.name || '—' },
        { key: 'core.label', label: 'Sediment composite profile', formatter: (s) => s || '—' },
        { key: 'ageInterval', formatter: ($0, $1, { ageMin: a, ageMax: b }) => (
          a === null || b === null ? '—' : `[${a}, ${b}]`
        ) },
        { key: 'samples' },
        { key: 'ageResolution', formatter: (n) => n && Number.parseFloat(n).toFixed(2) || '—' },
        { key: 'publication', formatter: ([{ doi = '', citation = 'View publication' } = {}] = [{}]) => (
          { doi, citation }
        ) },
        { key: 'actions', label: '' },
      ],
      codes: { STATUS_OKAY: 0, STATUS_LOAD: 1, STATUS_DONE: 2 },
      network: NetworkStatus,
    };
  },
  watch: {
    datasetId () {
      this.shouldFetchMore = true;
      this.timesFetched = 0;
    },
  },
  activated () {
    this.isDeactivated = false;
    let comp = this.$refs.mapComponent;
    comp = comp && comp.length ? comp[0] : comp;
    comp && comp.$map && comp.$map.updateSize();
  },
  deactivated () {
    this.isDeactivated = true;
  },
  methods: {
    stripUrl (value) {
      let re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
      return (value || '').replace(re, '');
    },
    updateMapCenter ({ data: lake }) {
      if (lake) {
        if (!this.currentLake || this.currentLake.uuid !== lake.uuid) {
          this.mapCenter = [lake.longitude, lake.latitude];
        }
        this.currentLake = lake;
      }
    },
    datasetsListBlur ({ target }) {
      if (target.tagName === 'TD') {
        let elem = target.parentElement.parentElement.querySelector('tr:focus');
        elem && elem.blur();
      }
    },
    datasetsListFocus ({ target }) {
      if (target.tagName === 'TD') {
        this.datasetsListBlur({ target });
        let boundaryBottom, tableRowRect = target.parentElement.getBoundingClientRect();
        let tableContainer = target.parentElement.parentElement.parentElement.parentElement;
        if (tableContainer.classList.contains('b-table-sticky-header')) {
          boundaryBottom = tableContainer.getBoundingClientRect().bottom;
        } else {
          boundaryBottom = window.innerHeight || document.documentElement.clientHeight;
        }
        if (tableRowRect.bottom <= boundaryBottom) {
          target.parentElement.focus();
        }
      }
    },
    datasetsListClicked (item) {
      if (!this.datasetId) {
        item._showDetails = !item._showDetails;
      }
    },
    datasetsListExtraClicked (item) {
      item._showMore = !item._showMore;
    },
    getFields (dataset) {
      if (dataset) {
        return [{ key: '__rowNum__', label: '#' }].concat(
          dataset.attributes.map((attribute, column) => {
            return {
              key: `__${column}__`,
              label: attribute.name,
            };
          }).filter(({ label }) => {
            return !['core', 'section', 'coreSection', 'varveNumber'].includes(label);
          }).filter(({ label }) => {
            return ('sampleId' !== label) || ['14C', 'Tephra'].includes(dataset.categories[0].name);
          }).sort((a, b) => {
            const reverseOrder = [
              'varveThicknessTotal',
              'varveAge',
              'ageMax',
              'ageMin',
              'age',
              'depthBottom',
              'depthTop',
              'compositeDepth',
            ];
            return reverseOrder.findIndex(s => b.label === s) - reverseOrder.findIndex(s => a.label === s);
          }),
        );
      } else {
        return [];
      }
    },
    isInvalidValue (value) {
      return (!value || value === 'NaN') && typeof value !== 'number' && typeof value !== 'boolean';
    },
    loadDataset ({ target }) {
      this.shouldScrollDown = true;
      this.$router.replace(target.getAttribute('href'));
    },
    fetchMore (query, dataset = {}) {
      if (!query.loading && dataset.uuid) {
        query.fetchMore({
          variables: {
            offset: dataset.records.length,
          },
          updateQuery: (prev, { fetchMoreResult: more }) => {
            if (!more || !more.datasets[0].records.length) {
              this.shouldFetchMore = false;
              return prev;
            } else {
              prev.datasets[0].records.push(...more.datasets[0].records);
              return prev;
            }
          },
        });
      }
    },
    onIncomingResult ({ networkStatus }) {
      if (!process.env.VUE_SSR) {
        let status = this.network[networkStatus || 8];
        status += ' ' + '.'.repeat(12 - status.length);
        console.log(`[API] Network status: ${status} (${Date.now() / 1000})`);
        if (this.shouldScrollDown && this.network.ready === networkStatus) {
          this.shouldScrollDown = false;
          if (!this.isDeactivated) {
            scrollDown(this);
          }
        }
      }
    },
    onMapMounted () {
      this.fixResizeEvents();
      this.fixZoomButtons();
      ScaleLineLoad.then(() => {
        let comp = this.$refs.mapComponent;
        comp = comp && comp.length ? comp[0] : comp;
        comp.$map.getControls().extend([
          new ScaleLine(),
        ]);
      });
    },
    fixResizeEvents () {
      window.addEventListener('resize', () => {
        let canvas = this.$el.querySelector('.ol-viewport canvas');
        let comp = this.$refs.mapComponent;
        comp = comp && comp.length ? comp[0] : comp;
        if (!this.isDeactivated && canvas && comp && comp.$map) {
          requestAnimationFrame(() => {
            canvas.setAttribute('height', '0');
            comp.$map.updateSize();
          });
        }
      });
    },
    fixZoomButtons () {
      if (this.$el.querySelectorAll('.ol-zoom button').length < 2) {
        setTimeout(this.fixZoomButtons, 250);
      } else {
        let /** @param el {HTMLElement} */ setup = (el) => {
          let lastFocus = Date.now();
          el.addEventListener('focus', () => lastFocus = Date.now());
          el.addEventListener('click', ({ target }) => (Date.now() - lastFocus) < 60 && target.blur());
          el.addEventListener('mouseout', ({ target }) => target.blur());
        };
        this.$el.querySelectorAll('.ol-zoom button').forEach(setup);
      }
    },
    download (data, filename, mime) {
      const blob = new Blob([data], { type: mime });
      const anchor = /** @type {ChildNode|HTMLAnchorElement} */ (
        document.createElement('a')
      );
      anchor.href = window.URL.createObjectURL(blob);
      anchor.download = `${filename}`;
      anchor.style.display = 'none';
      document.body.appendChild(anchor).click();
      document.body.removeChild(anchor);
    },
    async exportCSV (dataset) {
      this.exportStatus = this.codes.STATUS_LOAD;
      let uuid = dataset.uuid,
          records = [...dataset.records],
          hasMore = dataset.samples > records.length,
          first = true;
      while (hasMore || first) {
        let { data: result } = await this.$apollo.query({
          query: await import('@/graphql/queries/LookupDataset.graphql'),
          variables: { uuid, first: 1000, offset: records.length },
          fetchPolicy: 'no-cache',
        });
        if (result && result.datasets.length && result.datasets[0].records.length) {
          dataset = result.datasets[0];
          records.push(...dataset.records);
          hasMore = dataset.samples > records.length;
        } else if (first && result && result.datasets.length) {
          dataset = result.datasets[0];
        } else {
          hasMore = false;
        }
        first = false;
      }
      const { publication: [pub = {}] = [], core: [core = {}] = [] } = dataset;
      const { lake: [lake = {}] = [] } = core;
      const reference = !pub.doi ? null : (
        pub.doi.match(/unpublished/i) ? pub.citation : `https://dx.doi.org/${pub.doi}`
      );
      const meta = {
        info: '0',
        lakeName: lake.name || 'n/a',
        lakeLatitude: lake.latitude || 'n/a',
        lakeLongitude: lake.longitude || 'n/a',
        sedimentProfile: core.label || 'n/a',
        coringMethod: core.coringMethod || 'n/a',
        drillDate: core.drillDate || 'n/a',
        analysisMethod: dataset.analysisMethod || 'n/a',
        comments: dataset.comments || 'n/a',
        reference: reference || 'n/a',
      };
      const keys = [
        'depthType',
        'errorType',
        'errorMean',
        'errorMin',
        'errorMax',
        'anchored',
        'anchorpointType',
        'anchorpointAge',
        'interpolationMethod',
        'calibrationCurve',
      ];
      const safeValue = val => 'string' === typeof val && (!isNaN(val) || val.includes(',')) ? `"${val}"` : val;
      const props = Object.entries({ ...dataset, ...dataset.extraProps || {} })
        .filter(([key, val]) => val !== null && keys.includes(key))
        .sort((a, b) => {
          let left = keys.findIndex(key => key === a[0]);
          let right = keys.findIndex(key => key === b[0]);
          return (left === -1 ? keys.length : left) - (right === -1 ? keys.length : right);
        }).reduce((obj, [key, val]) => {
          obj[key] = val;
          return obj;
        }, {});
      const extra = !Object.keys(props).length ? [] : (
        [[], ['extra', ...Object.keys(props)], ['0', ...Object.values(props).map(safeValue)]]
      );
      const header = ['data', ...dataset.attributes.map(({ name }) => name)];
      const rows = [[], Object.keys(meta), Object.values(meta).map(safeValue), ...extra, [], header, ...records.map(
        (record, rowIndex) => [`${rowIndex + 1}`, ...header.slice(1).map((
          (columnName, columnIndex) => safeValue(record[`__${columnIndex}__`])
        ))],
      )];
      this.download(rows.join('\n'), `${dataset.file || 'export'}.csv`, 'text/csv');
      this.exportStatus = this.codes.STATUS_DONE;
      setTimeout(() => {
        this.exportStatus = this.codes.STATUS_OKAY;
      }, 3000);
    },
  },
};
</script>
