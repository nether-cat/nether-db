<template>
  <ApolloQuery
    class="container-fluid"
    :query="require('../graphql/queries/LookupLake.graphql')"
    :variables="{
      uuid: lakeId
    }"
    :skip="!lakeId || isDeactivated"
  >
    <template v-slot:default="{ result: { loading, error, data } }">
      <BRow v-for="lake in (data ? data.lakes : [])" :key="lake.uuid">
        <BCol cols="12" lg="6">
          <BRow>
            <BCol>
              <BCard header-tag="header" footer-tag="footer">
                <h4 slot="header">Lake details</h4>
                <BContainer v-observe-visibility="toggleJumpButton" fluid class="card-text">
                  <BRow>
                    <BCol>
                      <h5 class="font-weight-normal text-left">
                        <span v-if="lake.name">{{ lake.name }}</span>
                        <span v-else><em>Unknown lake</em></span>
                        <span v-if="lake.countries" class="comma-separated text-muted">
                          (<span v-for="country in lake.countries" :key="country.code">{{ country.code }}</span>)
                        </span>
                      </h5>
                      <hr>
                      <BRow>
                        <BCol cols="5" class="text-right">Longitude:</BCol>
                        <BCol cols="7" class="text-left">{{ lake.longitude || '&mdash;' }}</BCol>
                      </BRow>
                      <BRow>
                        <BCol cols="5" class="text-right">Latitude:</BCol>
                        <BCol cols="7" class="text-left">{{ lake.latitude || '&mdash;' }}</BCol>
                      </BRow>
                      <BRow>
                        <BCol cols="5" class="text-right">Surface level:</BCol>
                        <BCol cols="7" class="text-left">{{ lake.surfaceLevel || '&mdash;' }}</BCol>
                      </BRow>
                      <hr>
                      <BRow>
                        <BCol cols="5" class="text-right">Maximum depth:</BCol>
                        <BCol cols="7" class="text-left">{{ lake.maxDepth || '&mdash;' }}</BCol>
                      </BRow>
                      <BRow>
                        <BCol cols="5" class="text-right">Surface area:</BCol>
                        <BCol cols="7" class="text-left">{{ lake.surfaceArea || '&mdash;' }}</BCol>
                      </BRow>
                      <BRow>
                        <BCol cols="5" class="text-right">Water body volume:</BCol>
                        <BCol cols="7" class="text-left">{{ lake.waterBodyVolume || '&mdash;' }}</BCol>
                      </BRow>
                      <hr v-if="lake.catchmentArea">
                      <BRow v-if="lake.catchmentArea">
                        <BCol cols="5" class="text-right">Catchment area:</BCol>
                        <BCol cols="7" class="text-left">{{ lake.catchmentArea }}</BCol>
                      </BRow>
                    </BCol>
                  </BRow>
                </BContainer>
              </BCard>
            </BCol>
          </BRow>
          <BRow>
            <BCol class="mt-4">
              <BCard>
                <BTable hover
                        outlined
                        striped
                        caption-top
                        show-empty
                        :items="lake.cores.reduce((arr, core) => arr.concat(core.datasets), [])"
                        :fields="['type', 'ageResolution', 'actions']"
                >
                  <template slot="table-caption">
                    Available datasets:
                  </template>
                  <template slot="type" slot-scope="cell">
                    {{ cell.item.category[0].name.charAt(0).toUpperCase() + cell.item.category[0].name.slice(1) }}
                  </template>
                  <template slot="HEAD_ageResolution">
                    Samples per 1000 years
                  </template>
                  <template slot="ageResolution" slot-scope="cell">
                    {{ Number.parseFloat(cell.item.ageResolution).toFixed(3) }}
                  </template>
                  <template slot="actions" slot-scope="cell">
                    <BButton
                      size="sm"
                      variant="primary"
                      :disabled="datasetId === cell.item.uuid"
                      :to="{ query: { datasetId: cell.item.uuid } }"
                    >
                      Show records
                    </BButton>
                  </template>
                </BTable>
              </BCard>
            </BCol>
          </BRow>
        </BCol>
        <div class="d-block d-lg-none mt-4 w-100"/>
        <BCol cols="12" lg="6">
          <BCard header-tag="header" footer-tag="footer">
            <h4 slot="header">Map</h4>
            <BContainer fluid class="card-text rounded overflow-hidden">
              <Transition name="fade-opacity">
                <div v-show="isInitializing"
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
                  <VlMap ref="map"
                         :load-tiles-while-animating="true"
                         :load-tiles-while-interacting="true"
                         data-projection="EPSG:4326"
                         style="height: 485px"
                         @mounted="onMapMounted"
                  >
                    <VlView :max-zoom="18" :zoom="10" :center="[lake.longitude, lake.latitude]" :rotation="0"/>
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
      </BRow>
      <ApolloQuery
        v-if="datasetId"
        :tag="undefined"
        :query="require('graphql-tag')`
          query lookupDataset($uuid: ID!, $offset: Int!) {
            datasets: Dataset(uuid: $uuid) {
              uuid
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
              <BCard style="overflow-x: auto;">
                <BTable hover
                        outlined
                        striped
                        caption-top
                        show-empty
                        sort-by="__rowNum__"
                        :items="dataset.records.map((record, index) => Object.assign({}, record, { __rowNum__: index }))"
                        :fields="getFields(dataset)"
                >
                  <template slot="table-caption">
                    Records in the selected dataset:
                  </template>
                  <template slot="__rowNum__" slot-scope="cell">
                    {{ cell.item.__rowNum__ + 1 }}
                  </template>
                  <template v-for="{ key } in getFields(dataset).slice(1)" :slot="key" slot-scope="cell">
                    <span :key="key">
                      {{ cell.item[key] }}<i v-if="!cell.item[key]" class="long-dash"/>
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
      <Transition name="fade-opacity">
        <div v-if="showJumpButton" class="btn-overlay">
          <BButton v-scroll-to="{ el: 'body', force: false, ...scrollEvents }" variant="link">
            <FontAwesomeIcon :icon="['far', 'arrow-alt-circle-up']" size="5x"/>
          </BButton>
        </div>
      </Transition>
    </template>
  </ApolloQuery>
</template>

<script>
import debounce from 'lodash/debounce';
import { sentenceCase } from 'change-case';

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

export default {
  name: 'ViewDatabaseDetails',
  components: {
    ...SkipSSR,
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
      showJumpButton: false,
      scrollEvents: {
        onStart: () => (this.showJumpButton = false),
        onCancel: () => (this.showJumpButton = true),
      },
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
  },
  deactivated () {
    this.isDeactivated = true;
  },
  methods: {
    getFields (dataset) {
      if (dataset) {
        return [{ key: '__rowNum__', label: '#' }].concat(
          dataset.attributes.map((attribute, column) => {
            return {
              key: `__${column}__`,
              label: sentenceCase(attribute.name),
            };
          }),
        );
      } else {
        return [];
      }
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
      if (!process.env.VUE_SSR && !this.isDeactivated) {
        scrollDown(this);
      }
    },
    onMapMounted () {
      ScaleLineLoad.then(() => {
        let map = this.$refs.map;
        map = map.length ? map[0] : map;
        map.$map.getControls().extend([
          new ScaleLine(),
        ]);
      });
    },
    toggleJumpButton (disable = true) {
      this.showJumpButton = !disable;
    },
  },
};
</script>
