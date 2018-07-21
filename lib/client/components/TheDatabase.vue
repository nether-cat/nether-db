<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12" lg="6">
        <b-card header-tag="header" footer-tag="footer">
          <h1 slot="header">Filter options</h1>
          <b-form class="card-text container-fluid">
            <b-row>
              <b-col>
                <b-form-group label="Search terms:">
                  <v-tags-input v-model="form.terms.text"
                                :tags.sync="form.terms.array"
                                :class="form.terms.classes"
                                :separators="[';', ',']"
                                :autocomplete-items="[{text:'foo'},{text:'bar'}]"
                                :autocomplete-always-open="form.terms.focused"
                                @focus="onFocus(form.terms)"
                                @blur="onBlur(form.terms)"
                                placeholder="Add proxies, keywords, authors, etc."/>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-form-group label="Locations:">
                  <b-form-input type="text"
                                v-model="form.location"
                                required
                                placeholder="Add coordinates, continents or countries"/>
                </b-form-group>
              </b-col>
            </b-row>
          </b-form>
        </b-card>
      </b-col>
      <div class="d-block d-lg-none mt-4 w-100"></div>
      <b-col cols="12" lg="6">
        <b-card header-tag="header" footer-tag="footer">
          <h1 slot="header">Map</h1>
          <b-container fluid class="card-text">
            <div style="height: 400px">
            <no-ssr>
              <b-progress variant="primary" animated class="mb-3" slot="placeholder">
                <b-progress-bar :value="100">Loading map...</b-progress-bar>
              </b-progress>
              <vl-map :load-tiles-while-animating="true" :load-tiles-while-interacting="true" data-projection="EPSG:4326" style="height: 400px">
                <vl-view :zoom.sync="map.zoom" :center.sync="map.center" :rotation.sync="map.rotation"></vl-view>
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
    <b-row>
      <b-col class="mt-4">
        <b-card>
          <b-table hover outlined striped caption-top :items="results">
            <template slot="table-caption">
              This is a table caption.
            </template>
          </b-table>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import { mapState } from 'vuex';
  import * as CountryList from 'countries-list';
  import bTable from 'bootstrap-vue/es/components/table/table';

  const noSSR = {};

  if (process.env.VUE_ENV !== 'server') {
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
      vlLayerTile: () => vlLoad.then(module => module.TileLayer['Layer']).catch(() => fallback),
      vlSourceOsm: () => vlLoad.then(module => module.OsmSource['Source']).catch(() => fallback),
    });
  }

  export default {
    name: 'TheDatabase',
    components: {
      bTable,
      ...noSSR,
    },
    async prefetchData ({ store, route, renderContext }) {
      if (!store.getters['user/isAuthenticated']) {
        await store.dispatch('user/doRefresh', renderContext);
      }
    },
    data () {
      return {
        values: {
          terms: {
            text: '',
            array: [],
            focused: false,
          },
          location: ''
        },
        map: {
          zoom: 1,
          center: [0, 20],
          rotation: 0,
        },
      };
    },
    computed: {
      results () {
        return Object.entries(CountryList.continents);
      },
      form () {
        const form = this.values;
        form.terms.classes = {
          'allow--enter': !!form.terms.text,
          'allow--delete': !form.terms.text && form.terms.array.length,
        };
        return form;
      },
      ...mapState('user', [
        'user',
      ]),
    },
    methods: {
      onFocus (obj) {
        window.setTimeout(() => obj.focused = true, 50);
      },
      onBlur (obj) {
        window.setTimeout(() => obj.focused = false, 50);
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~vuelayers/lib/style.css';
</style>
