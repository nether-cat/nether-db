<template>
  <b-container fluid>
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
                    (<span v-for="country in countries">{{ country.code }}</span>)
                  </span>
                </h5>
                <hr/>
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
                  <b-col cols="7" class="text-left">{{ lake.surface_level || '&mdash;' }}</b-col>
                </b-row>
                <hr/>
                <b-row>
                  <b-col cols="5" class="text-right">Maximum depth:</b-col>
                  <b-col cols="7" class="text-left">{{ lake.max_depth || '&mdash;' }}</b-col>
                </b-row>
                <b-row>
                  <b-col cols="5" class="text-right">Surface area:</b-col>
                  <b-col cols="7" class="text-left">{{ lake.surface_area || '&mdash;' }}</b-col>
                </b-row>
                <b-row>
                  <b-col cols="5" class="text-right">Water body volume:</b-col>
                  <b-col cols="7" class="text-left">{{ lake.water_body_volume || '&mdash;' }}</b-col>
                </b-row>
                <hr v-if="lake.catchment_area"/>
                <b-row v-if="lake.catchment_area">
                  <b-col cols="5" class="text-right">Catchment area:</b-col>
                  <b-col cols="7" class="text-left">{{ lake.catchment_area }}</b-col>
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
              <b-table hover outlined striped caption-top show-empty :items="collections" :fields="['type', 'year', 'actions']">
                <template slot="table-caption">
                  Available datasheets:
                </template>
                <!--suppress HtmlUnknownAttribute -->
                <template slot="type" slot-scope="cell">
                  {{ cell.item.type.charAt(0).toUpperCase() + cell.item.type.slice(1) }}
                </template>
                <!--suppress HtmlUnknownAttribute -->
                <template slot="actions" slot-scope="cell">
                  <b-button variant="primary" size="sm" @click="onCollectionClick(cell.item.id)">Show records</b-button>
                </template>
              </b-table>
            </b-card>
          </b-col>
        </b-row>
      </b-col>
      <div class="d-block d-lg-none mt-4 w-100"></div>
      <b-col cols="12" lg="6">
        <b-card header-tag="header" footer-tag="footer">
          <h1 slot="header">Map</h1>
          <b-container fluid class="card-text">
            <div style="height: 485px">
              <no-ssr>
                <b-progress variant="primary" animated class="mb-3" slot="placeholder">
                  <b-progress-bar :value="100">Loading map...</b-progress-bar>
                </b-progress>
                <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" ref="map"
                        data-projection="EPSG:4326" style="height: 485px" @mounted="onMapMounted">
                  <vl-view :max-zoom="18" :zoom="10" :center="[lake.longitude, lake.latitude]" :rotation="0"></vl-view>
                  <vl-feature v-for="result in [lake]"
                              :result="result"
                              :key="'vl_feature_' + result.id"
                              :id="'vl_feature_' + result.id"
                              :properties="{ id: result.id, name: result.name }">
                    <vl-geom-point :coordinates="[result.longitude, result.latitude]"></vl-geom-point>
                    <vl-style-box :z-index="1">
                      <vl-style-stroke color="#ffffff" :width="1.5"></vl-style-stroke>
                      <vl-style-fill :color="[0, 153, 255, 1]"></vl-style-fill>
                      <vl-style-circle :radius="6">
                        <vl-style-stroke color="#ffffff" :width="1.5"></vl-style-stroke>
                        <vl-style-fill :color="[0, 153, 255, 1]"></vl-style-fill>
                      </vl-style-circle>
                    </vl-style-box>
                  </vl-feature>
                  <vl-layer-tile id="osm">
                    <vl-source-osm></vl-source-osm>
                  </vl-layer-tile>
                </vl-map>
              </no-ssr>
            </div>
          </b-container>
        </b-card>
      </b-col>
    </b-row>
    <b-row v-if="showRecords && records && records.length">
      <b-col class="mt-4">
        <b-card>
          <b-table hover outlined striped caption-top show-empty :items="records" :fields="Object.keys(records[0])">
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

  const noSSR = {};

  let ScaleLine, ScaleLineLoad;

  if (process.env.VUE_ENV !== 'server') {
    ScaleLineLoad = import('ol/control/scaleline')
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
      };
    },
    computed: {
      ...mapState('database', [
        'results',
        'records',
      ]),
      ...mapGetters('database', [
        'reducedResults',
        'lake',
        'countries',
        'collections',
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
        this.loadCollection(id);
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
