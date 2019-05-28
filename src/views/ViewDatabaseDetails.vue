<template>
  <BContainer v-if="lake" fluid>
    <BRow>
      <BCol cols="12" lg="6">
        <BRow>
          <BCol>
            <BCard header-tag="header" footer-tag="footer">
              <h4 slot="header">Lake details</h4>
              <BContainer fluid class="card-text">
                <BRow>
                  <BCol>
                    <h5 class="font-weight-normal text-left">
                      <span v-if="lake.name">{{ lake.name }}</span>
                      <span v-else><em>Unknown lake</em></span>
                      <span v-if="countries" class="comma-separated text-muted">
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
                      :items="datasets"
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
                  <BButton variant="primary" size="sm" @click="onDatasetClick(cell.item)">Show records</BButton>
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
          <BContainer fluid class="card-text">
            <Transition name="fade-cover">
              <div v-show="map.loading" class="loading-cover" style="height: 485px; line-height: 485px;">
                <div>Map loading...<br><FontAwesomeIcon icon="circle-notch" size="5x" spin/></div>
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
                    <VlSourceOsm @mounted="onSourceOsmMounted"/>
                  </VlLayerTile>
                </VlMap>
              </SkipServerSide>
            </div>
          </BContainer>
        </BCard>
      </BCol>
    </BRow>
    <BRow v-if="showRecords && dataset && flatRecords && flatRecords.length">
      <BCol class="mt-4">
        <BCard style="overflow-x: auto;">
          <BTable hover
                  outlined
                  striped
                  caption-top
                  show-empty
                  sort-by="__rowNum__"
                  :items="flatRecords"
                  :fields="[{ key: '__rowNum__', label: '#' }].concat(dataset.attributes.map(a => a.name))"
          >
            <template slot="table-caption">
              Records in the selected dataset:
            </template>
            <template slot="__rowNum__" slot-scope="cell">
              {{ cell.item.__rowNum__ + 1 }}
            </template>
          </BTable>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

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

export default {
  name: 'ViewDatabaseDetails',
  components: {
    ...SkipSSR,
  },
  data () {
    return {
      showRecords: false,
      dataset: {},
      datasetUUID: '',
      lakes: [],
      countries: [],
      records: [],
      map: {
        loading: true,
      },
    };
  },
  apollo: {
    lakes: {
      prefetch: false,
      query: ESLint$1.gql`
        query lakeByUUID($uuid: ID!) {
          lakes: Lake(uuid: $uuid, orderBy: "name_asc") {
            uuid
            name
            longitude
            latitude
            maxDepth
            surfaceLevel
            surfaceArea
            catchmentArea
            waterBodyVolume
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
                ageResolution
                file
                attributes {
                  uuid
                  name
                }
                category {
                  uuid
                  name
                }
              }
            }
          }
        }
      `,
      variables() {
        // Use vue reactive properties here
        return {
          uuid: this.$route.params['id'],
        };
      },
    },
    records: {
      prefetch: false,
      query: ESLint$1.gql`
        query getRecords($uuid: ID!) {
          records: RecordsByDataset(uuid: $uuid) {
            _id
            data
          }
        }
      `,
      variables() {
        // Use vue reactive properties here
        return {
          uuid: this.datasetUUID,
        };
      },
    },
  },
  computed: {
    lake () {
      if (this.lakes) {
        return this.lakes[0];
      } else {
        return undefined;
      }
    },
    datasets () {
      if (this.lake) {
        return this.lake.cores.reduce((datasets, core) => datasets.concat(core.datasets), []);
      } else {
        return [];
      }
    },
    flatRecords () {
      if (this.records) {
        return this.records.map(r => Object.assign({ _id: r['_id'] }, r['data']));
      } else {
        return [];
      }
    },
    ...mapState('database', [
      'results',
      //'records',
    ]),
    ...mapGetters('database', [
      'reducedResults',
      //'lake',
      //'countries',
      //'datasets',
    ]),
  },
  created () {
    this.$store.commit('database/DETAILS_ID_SET', this.$route.params['id']);
  },
  activated () {
    this.$apollo.queries.lakes.skip = false;
    this.$apollo.queries.records.skip = false;
  },
  deactivated () {
    this.$apollo.queries.lakes.skip = true;
    this.$apollo.queries.records.skip = true;
  },
  methods: {
    ...mapActions('database', [
      'loadCollection',
    ]),
    onDatasetClick (dataset) {
      this.showRecords = true;
      this.datasetUUID = dataset.uuid;
      this.dataset = dataset;
    },
    onMapMounted () {
      ScaleLineLoad.then(() => {
        // noinspection JSUnresolvedFunction
        this.$refs.map.$map.getControls().extend([
          new ScaleLine(),
        ]);
      });
    },
    onSourceOsmMounted () {
      this.map.loading = false;
    },
  },
};
</script>
