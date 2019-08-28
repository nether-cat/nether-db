<template>
  <ApolloQuery
    class="container-fluid"
    :query="require('../graphql/queries/LookupLake.graphql')"
    :variables="{
      uuid: lakeId
    }"
    :skip="!lakeId || isDeactivated"
    @result="updateMapCenter"
  >
    <template v-slot:default="{ result: { loading, error, data } }">
      <BRow v-for="lake in (data ? data.lakes : [])" :key="lake.uuid">
        <BCol cols="12" lg="6">
          <BCard class="h-100">
            <BContainer fluid class="card-text">
              <BRow>
                <BCol class="grid-format-data">
                  <h5 class="font-weight-normal text-left">
                    <span v-if="lake.name">{{ lake.name }}</span>
                    <span v-else><em>Unnamed site</em></span>
                    <span v-if="lake.countries" class="comma-separated text-muted">
                      (<span v-for="country in lake.countries" :key="country.code">{{ country.code }}</span>)
                    </span>
                  </h5>
                  <hr>
                  <BRow>
                    <BCol cols="5">Latitude:</BCol>
                    <BCol cols="5">
                      <pre>{{
                        Math.abs(lake.latitude) | formatNumber(5) + ('number' === typeof lake.latitude ? '°' : '—')
                      }}</pre>
                    </BCol>
                    <BCol><pre>{{ lake.latitude | formatUnit(0 > lake.latitude ? 'S' : 'N') }}</pre></BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5">Longitude:</BCol>
                    <BCol cols="5">
                      <pre>{{
                        Math.abs(lake.longitude) | formatNumber(5) + ('number' === typeof lake.longitude ? '°' : '—')
                      }}</pre>
                    </BCol>
                    <BCol><pre>{{ lake.longitude | formatUnit(0 > lake.longitude ? 'W' : 'E') }}</pre></BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5">Surface elevation:</BCol>
                    <BCol cols="5"><pre>{{ lake.surfaceLevel | formatNumber }}</pre></BCol>
                    <BCol><pre>{{ lake.surfaceLevel | formatUnit('m') }}</pre></BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5">Maximum depth:</BCol>
                    <BCol cols="5"><pre>{{ lake.maxDepth | formatNumber }}</pre></BCol>
                    <BCol><pre>{{ lake.maxDepth | formatUnit('m') }}</pre></BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5">Surface area:</BCol>
                    <BCol cols="5"><pre>{{ lake.surfaceArea | formatNumber }}</pre></BCol>
                    <BCol><pre>{{ lake.surfaceArea | formatUnit('m²') }}</pre></BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5">Water body volume:</BCol>
                    <BCol cols="5"><pre>{{ lake.waterBodyVolume | formatNumber }}</pre></BCol>
                    <BCol><pre>{{ lake.waterBodyVolume | formatUnit('m³') }}</pre></BCol>
                  </BRow>
                  <BRow>
                    <BCol cols="5">Catchment area:</BCol>
                    <BCol cols="5"><pre>{{ lake.catchmentArea | formatNumber }}</pre></BCol>
                    <BCol><pre>{{ lake.catchmentArea | formatUnit('m²') }}</pre></BCol>
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
                  <VlMap ref="mapComponent"
                         :load-tiles-while-animating="true"
                         :load-tiles-while-interacting="true"
                         data-projection="EPSG:4326"
                         @mounted="onMapMounted"
                  >
                    <VlView :max-zoom="18" :zoom="10" :center="mapCenter" :rotation="0"/>
                    <VlFeature v-for="result in [lake]"
                               :id="result.uuid"
                               :key="result.uuid"
                               :properties="{ id: result.uuid, name: result.name }"
                    >
                      <VlGeomPoint :coordinates="[result.longitude, result.latitude]"/>
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
            <BTable hover
                    outlined
                    striped
                    caption-top
                    show-empty
                    class="table-toggle"
                    :items="[].concat(...lake.cores.map(core => core.datasets.map(d => (
                      { ...d, core, _showDetails: isDatasetSelected(d) }
                    ))))"
                    :fields="datasetsListFields"
                    @row-clicked="datasetsListClicked"
                    @mouseover.native="datasetsListFocus"
                    @mouseout.native="datasetsListBlur"
            >
              <template slot="table-caption">
                {{ [].concat(...lake.cores.map(core => core.datasets)).length }} datasets available for this site:
              </template>
              <template slot="row-details" slot-scope="{ item }">
                <div @click="datasetsListClicked(item)">
                  <div style="margin-left: .75rem; padding: .75rem 0; width: calc(100% - 1.5rem)">
                    <span class="py-2 pr-2" :class="{ 'font-italic': !item.core.label }">
                      <FontAwesomeIcon icon="link"/>&ensp;{{ item.core.label || 'unnamed' }}
                    </span>
                    <span v-if="item.core.latitude && item.core.longitude" class="p-2">
                      <FontAwesomeIcon icon="map-pin"/>&ensp;{{ item.core | coordinates }}
                    </span>
                    <span v-if="item.core.coringMethod" class="p-2">
                      <FontAwesomeIcon icon="angle-double-up"/>&ensp;{{ item.core.coringMethod }}
                    </span>
                    <span v-if="item.core.drillDate" class="p-2">
                      <FontAwesomeIcon icon="clock"/>&ensp;{{ item.core.drillDate }} AD
                    </span>
                    <span v-if="item.core.waterDepth" class="p-2">
                      <FontAwesomeIcon icon="level-down-alt"/>&ensp;{{ item.core.waterDepth }} m
                    </span>
                    <span v-if="item.publication && item.publication.length && item.publication[0].citation">
                      <br>&nbsp;<br>
                    </span>
                    <span v-if="item.publication && item.publication.length && item.publication[0].citation"
                          class="py-2 pr-2 d-lg-inline-block w-50"
                    >
                      <FontAwesomeIcon icon="quote-right"/>&ensp;{{ (item.publication[0].citation || '') | stripUrl }}
                      <span v-if="item.publication[0].doi">
                        <ExternalLink :href="`https://dx.doi.org/${item.publication[0].doi}`" @click.stop/>.
                      </span>
                    </span>
                  </div>
                </div>
              </template>
              <template slot="categories" slot-scope="{ value }">
                {{ value | upperCaseFirst }}
              </template>
              <template slot="HEAD_ageInterval">
                Ages&ensp;<span class="font-weight-lighter text-secondary">[yr BP] in [<em>min</em>, <em>max</em>]</span>
              </template>
              <template slot="HEAD_samples">
                Samples&ensp;<span class="font-weight-lighter text-secondary">[<em>count</em>]</span>
              </template>
              <template slot="HEAD_ageResolution">
                Resolution&ensp;<span class="font-weight-lighter text-secondary">[Samples / kyr]</span>
              </template>
              <template slot="HEAD_publication">
                Reference&ensp;<span class="font-weight-lighter text-secondary">[DOI]</span>
              </template>
              <template slot="publication" slot-scope="{ value: { doi, citation } }">
                <a v-if="doi"
                   v-b-tooltip.hover.bottom.html="{
                     customClass: 'tooltip-table-cell',
                     title: citation.replace(
                       /Available at:? https?:\/\/.*doi\.org\/(.*?)\.?\s$/i,
                       '<span class=\'d-inline-block mw-100 align-bottom text-truncate\'>doi:$1</span>',
                     ),
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
              <template slot="actions" slot-scope="{ item }">
                <div class="text-center">
                  <BButton
                    v-if="datasetId !== item.uuid"
                    size="sm"
                    variant="secondary"
                    style="min-width: 4rem"
                    :href="$router.resolve({ query: { datasetId: item.uuid } }).href"
                    @click.prevent="loadDataset"
                  >
                    Open
                  </BButton>
                  <BButton
                    v-else
                    size="sm"
                    variant="danger"
                    style="min-width: 4rem"
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
        v-if="datasetId"
        :tag="undefined"
        :query="require('graphql-tag')`
          query lookupDataset($uuid: ID!, $offset: Int!) {
            datasets: Dataset(uuid: $uuid) {
              uuid
              file
              label
              samples
              attributes {
                uuid
                name
              }
              records(first: 100, offset: $offset)
            }
          }
        `"
        :variables="{
          uuid: datasetId,
          offset: 0,
        }"
        :skip="!datasetId || isDeactivated"
        :throttle="300"
        @result="() => timesFetched++ || onFirstRecords()"
      >
        <template v-slot:default="{ query, isLoading, result: { loading, error, data } }">
          <BRow v-for="(dataset, num) in (data ? data.datasets : [])"
                :id="`recordsTable${ num ? '-' + num : '' }`"
                :key="dataset.uuid"
          >
            <BCol class="mt-4">
              <BCard class="overflow-auto">
                <div class="table-actions">
                  <BButton size="sm" variant="outline-primary" @click="getCsv(dataset)">
                    <FontAwesomeIcon icon="download"/> CSV
                  </BButton>
                </div>
                <BTable outlined
                        striped
                        caption-top
                        show-empty
                        sort-by="__rowNum__"
                        :items="dataset.records.map((r, i) => Object.assign({}, r, { __rowNum__: i }))"
                        :fields="getFields(dataset)"
                >
                  <template slot="table-caption">
                    {{ dataset.samples }} samples recorded in this dataset:
                  </template>
                  <template slot="__rowNum__" slot-scope="cell">
                    {{ cell.item.__rowNum__ + 1 }}
                  </template>
                  <template v-for="{ key } in getFields(dataset).slice(1)" :slot="'HEAD_' + key" slot-scope="{ label }">
                    <span :key="'HEAD_' + key">
                      {{ label | sentenceCase }}
                    </span>
                  </template>
                  <template v-for="{ key } in getFields(dataset).slice(1)" :slot="key" slot-scope="cell">
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
    stripUrl (value) {
      let re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
      return value.replace(re, '');
    },
  },
  props: {
    lakeId: { type: String, default: undefined },
    datasetId: { type: String, default: undefined },
  },
  data () {
    return {
      timesFetched: 0,
      isDeactivated: false,
      isInitializing: true,
      shouldFetchMore: true,
      shouldScrollDown: false,
      datasetsListFields: [
        { key: 'categories', label: 'Subject', formatter: ([category]) => category && category.name || '—' },
        { key: 'core.label', label: 'Core label', formatter: (s) => s || '—' },
        { key: 'ageInterval', formatter: ($0, $1, dataset) => `[${dataset.ageMin}, ${dataset.ageMax}]` },
        'samples',
        { key: 'ageResolution', formatter: (n) => n && Number.parseFloat(n).toFixed(3) || '—' },
        { key: 'publication', formatter: (
          [{ doi = '', citation = 'View publication' } = {}] = [{}],
        ) => ({ doi, citation }) },
        { key: 'actions', label: '' },
      ],
      currentLake: undefined,
      mapCenter: [0, 8],
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
    updateMapCenter ({ data: { lakes: [lake] } }) {
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
        let rect = target.parentElement.getBoundingClientRect();
        if (rect && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
          target.parentElement.focus();
        }
      }
    },
    datasetsListClicked (item, index) {
      item._showDetails = !item._showDetails;
    },
    isDatasetSelected (dataset) {
      return dataset.uuid === this.datasetId;
    },
    getFields (dataset) {
      if (dataset) {
        return [{ key: '__rowNum__', label: '#' }].concat(
          dataset.attributes.map((attribute, column) => {
            return {
              key: `__${column}__`,
              label: attribute.name,
            };
          }),
        );
      } else {
        return [];
      }
    },
    isInvalidValue (value) {
      return !value && typeof value !== 'number' && typeof value !== 'boolean';
    },
    loadDataset ({ target }) {
      this.shouldScrollDown = true;
      this.$router.replace(target.getAttribute('href'));
    },
    fetchMore (query, dataset = {}) {
      if (dataset.uuid) {
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
    onFirstRecords () {
      if (!process.env.VUE_SSR && !this.isDeactivated && this.shouldScrollDown) {
        scrollDown(this);
      }
      this.shouldScrollDown = false;
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
        this.$el.querySelectorAll('.ol-zoom button').forEach(btn => {
          let lastFocus = Date.now();
          btn.addEventListener('focus', () => lastFocus = Date.now());
          btn.addEventListener('click', ({ target }) => (Date.now() - lastFocus) < 60 && target.blur());
          btn.addEventListener('mouseout', ({ target }) => target.blur());
        });
      }
    },
    objectToCsv (data) {
      const csvRows = [];
      const headers = [];
      for (let i = 0; i < data[1].length; i++) {
        headers.push((data[0][i][0]));
      }
      console.log(headers);
      csvRows.push(headers.join(','));
      for (let row = 0; row < data.length; row++) {
        let newRow = [row + 1];
        for (let i = 1; i < data[1].length; i++) {
          newRow.push((data[row][i][1]));
        }
        csvRows.push(newRow);
      }
      return csvRows.join('\n');
    },
    download (data, name) {
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${name}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    getCsv (dataset) {
      const data = [];
      const attributes = [{ label: '#' }].concat(
        dataset.attributes.map((attribute) => {
          return {
            label: attribute.name,
          };
        }),
      );
      for (let i = 0; i < dataset.records.length; i++) {
        let newRow = [['#', i + 1]];
        for (let f = 0; f < attributes.length - 1; f++) {
          newRow.push(['' + Object.values(attributes[f + 1]), dataset.records[i][`__${f}__`]]);
        }
        data.push(newRow);
      };
      console.log(data);
      const csvData = this.objectToCsv(data);
      this.download(csvData, dataset.file || 'export');
      console.log(csvData);

    },
  },
};
</script>
