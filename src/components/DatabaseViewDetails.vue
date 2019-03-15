<template>
  <b-container v-if="lake" fluid>
    <b-row>
      <b-col cols="12" lg="6">
        <b-row>
          <b-col>
            <b-card header-tag="header" footer-tag="footer">
              <h1 slot="header">Lake details</h1>
              <b-container fluid class="card-text">
                <b-row>
                  <b-col>
                    <h5 class="font-weight-normal text-left">
                      <span v-if="lake.name">{{ lake.name }}</span>
                      <span v-else><em>Unknown lake</em></span>
                      <span v-if="countries" class="comma-separated text-muted">
                        (<span v-for="country in lake.countries" :key="country.code">{{ country.code }}</span>)
                      </span>
                    </h5>
                    <hr>
                    <b-row>
                      <b-col cols="5" class="text-right">Longitude:</b-col>
                      <b-col cols="7" class="text-left">{{ lake.longitude || '&mdash;' }}</b-col>
                    </b-row>
                    <b-row>
                      <b-col cols="5" class="text-right">Latitude:</b-col>
                      <b-col cols="7" class="text-left">{{ lake.latitude || '&mdash;' }}</b-col>
                    </b-row>
                    <b-row>
                      <b-col cols="5" class="text-right">Surface level:</b-col>
                      <b-col cols="7" class="text-left">{{ lake.surfaceLevel || '&mdash;' }}</b-col>
                    </b-row>
                    <hr>
                    <b-row>
                      <b-col cols="5" class="text-right">Maximum depth:</b-col>
                      <b-col cols="7" class="text-left">{{ lake.maxDepth || '&mdash;' }}</b-col>
                    </b-row>
                    <b-row>
                      <b-col cols="5" class="text-right">Surface area:</b-col>
                      <b-col cols="7" class="text-left">{{ lake.surfaceArea || '&mdash;' }}</b-col>
                    </b-row>
                    <b-row>
                      <b-col cols="5" class="text-right">Water body volume:</b-col>
                      <b-col cols="7" class="text-left">{{ lake.waterBodyVolume || '&mdash;' }}</b-col>
                    </b-row>
                    <hr v-if="lake.catchmentArea">
                    <b-row v-if="lake.catchmentArea">
                      <b-col cols="5" class="text-right">Catchment area:</b-col>
                      <b-col cols="7" class="text-left">{{ lake.catchmentArea }}</b-col>
                    </b-row>
                  </b-col>
                </b-row>
              </b-container>
            </b-card>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="mt-4">
            <b-card>
              <b-table hover
                       outlined
                       striped
                       caption-top
                       show-empty
                       :items="collections"
                       :fields="['type', 'ageResolution', 'actions']"
              >
                <template slot="table-caption">
                  Available datasheets:
                </template>
                <template slot="type" slot-scope="cell">
                  {{ cell.item.proxy[0].name.charAt(0).toUpperCase() + cell.item.proxy[0].name.slice(1) }}
                </template>
                <!-- eslint-disable-next-line vue/no-unused-vars -->
                <template slot="HEAD_ageResolution" slot-scope="cell">
                  Records per 1000 years
                </template>
                <template slot="actions" slot-scope="cell">
                  <b-button variant="primary" size="sm" @click="onCollectionClick(cell.item.uuid)">Show records</b-button>
                </template>
              </b-table>
            </b-card>
          </b-col>
        </b-row>
      </b-col>
      <div class="d-block d-lg-none mt-4 w-100"/>
      <b-col cols="12" lg="6">
        <b-card header-tag="header" footer-tag="footer">
          <h1 slot="header">Map</h1>
          <b-container fluid class="card-text">
            <div style="height: 485px">
              <no-ssr>
                <b-progress slot="placeholder" variant="primary" animated class="mb-3">
                  <b-progress-bar :value="100">Loading map...</b-progress-bar>
                </b-progress>
                <vl-map ref="map"
                        :load-tiles-while-animating="true"
                        :load-tiles-while-interacting="true"
                        data-projection="EPSG:4326"
                        style="height: 485px"
                        @mounted="onMapMounted"
                >
                  <vl-view :max-zoom="18" :zoom="10" :center="[lake.longitude, lake.latitude]" :rotation="0"/>
                  <vl-feature v-for="result in [lake]"
                              :id="'vl_feature_' + result.uuid"
                              :key="'vl_feature_' + result.uuid"
                              :result="result"
                              :properties="{ id: result.uuid, name: result.name }"
                  >
                    <vl-geom-point :coordinates="[result.longitude, result.latitude]"/>
                    <vl-style-box :z-index="1">
                      <vl-style-circle :radius="6">
                        <vl-style-stroke :color="[255, 255, 255, 1]" :width="1.5"/>
                        <vl-style-fill :color="[0, 153, 255, 1]"/>
                      </vl-style-circle>
                    </vl-style-box>
                  </vl-feature>
                  <vl-layer-tile id="osm">
                    <vl-source-osm/>
                  </vl-layer-tile>
                </vl-map>
              </no-ssr>
            </div>
          </b-container>
        </b-card>
      </b-col>
    </b-row>
    <b-row v-if="showRecords && flatRecords && flatRecords.length">
      <b-col class="mt-4">
        <b-card style="overflow-x: auto;">
          <b-table hover
                   outlined
                   striped
                   caption-top
                   show-empty
                   sort-by="rowNum"
                   :items="flatRecords"
                   :fields="[{key: 'rowNum', label: 'No.'}].concat(Object.keys(flatRecords[0]).filter(k => !['_id', 'rowNum'].includes(k)))"
          >
            <template slot="table-caption">
              Records in the selected datasheet:
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
import gql from 'graphql-tag';

const noSSR = {};

let ScaleLine, ScaleLineLoad;

if (process.client) {
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
  const vlLoad = import('vuelayers').catch(e => console.error(e));
  // noinspection JSUnusedGlobalSymbols
  Object.assign(noSSR, {
    vlMap: () => vlLoad.then(module => module.Map['Map']).catch(() => fallback),
    vlView: () => vlLoad.then(module => module.Map['View']).catch(() => fallback),
    vlFeature: () => vlLoad.then(module => module.Feature['Feature']).catch(() => fallback),
    vlGeomPoint: () => vlLoad.then(module => module.PointGeom['Geom']).catch(() => fallback),
    vlLayerTile: () => vlLoad.then(module => module.TileLayer['Layer']).catch(() => fallback),
    vlSourceOsm: () => vlLoad.then(module => module.OsmSource['Source']).catch(() => fallback),
    vlStyleBox: () => vlLoad.then(module => module.StyleBox['Style']).catch(() => fallback),
    vlStyleFill: () => vlLoad.then(module => module.FillStyle['Style']).catch(() => fallback),
    vlStyleStroke: () => vlLoad.then(module => module.StrokeStyle['Style']).catch(() => fallback),
    vlStyleCircle: () => vlLoad.then(module => module.CircleStyle['Style']).catch(() => fallback),
  });
}

export default {
  name: 'DatabaseViewDetails',
  components: {
    bTable,
    ...noSSR,
  },
  data () {
    return {
      showRecords: false,
      collectionUUID: '',
      lakes: [],
      countries: [],
      records: [],
    };
  },
  apollo: {
    lakes: {
      query: gql`
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
              collections {
                uuid
                label
                ageResolution
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
      variables() {
        // Use vue reactive properties here
        return {
          uuid: this.$route.params['id'],
        };
      },
    },
    records: {
      query: gql`
        query getRecords($uuid: ID!) {
          records: RecordsByCollection(uuid: $uuid) {
            _id
            data
          }
        }
      `,
      variables() {
        // Use vue reactive properties here
        return {
          uuid: this.collectionUUID,
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
    collections () {
      if (this.lake) {
        return this.lake.cores.reduce((collections, core) => collections.concat(core.collections), []);
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
      //'collections',
    ]),
  },
  created () {
    this.$store.commit('database/DETAILS_ID_SET', this.$route.params['id']);
  },
  methods: {
    ...mapActions('database', [
      'loadCollection',
    ]),
    onCollectionClick (id) {
      this.showRecords = true;
      this.collectionUUID = id;
    },
    onMapMounted () {
      ScaleLineLoad.then(() => {
        // noinspection JSUnresolvedFunction
        this.$refs.map.$map.getControls().extend([
          new ScaleLine(),
        ]);
      });
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
