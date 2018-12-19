<template>
  <b-container fluid class="small">
    <b-row>
      <h6 onmouseover="" style="cursor: pointer;">List all lakes</h6>
    </b-row>
    <b-row>
      <h6 onmouseover="" style="cursor: pointer;">List all datasets</h6>
    </b-row>
    <b-row>
      <h6>Query builder:</h6>
    </b-row>
    <b-row class="toolbox">
      <!-- Input group for location filtering -->
      <span v-b-toggle.showLocationFilter onmouseover="" style="cursor: pointer;">Search by location</span>
      <b-collapse id="showLocationFilter">
        <b-form-group label="Location:">
          <b-form-input v-model="locationSelect.lakeName" placeholder="Lake..."></b-form-input>
        </b-form-group>

        <b-form-group>
          <b-form-input v-model="locationSelect.continent" placeholder="Continent..."></b-form-input>
        </b-form-group>

        <b-form-group>
          <b-form-input v-model="locationSelect.country" placeholder="Country..."></b-form-input>
        </b-form-group>

        <b-form-group label="Latitude:" id="inputX">
          <b-form-input v-model="locationSelect.latMin" placeholder="min (-90.00000)"></b-form-input>
          <b-form-input v-model="locationSelect.latMax" placeholder="max (90.00000)"></b-form-input>
        </b-form-group>

        <b-form-group label="Longitude:" id="inputY">
          <b-form-input v-model="locationSelect.lonMin" placeholder="min (-180.00000)"></b-form-input>
          <b-form-input v-model="locationSelect.lonMax" placeholder="max (180.00000)"></b-form-input>
        </b-form-group>

        <b-form-group label="Elevation:" label-for="inputZ">
          <b-form-input v-model="locationSelect.elevationMin" placeholder="min [m]"></b-form-input>
          <b-form-input v-model="locationSelect.elevationMax" placeholder="max [m]"></b-form-input>
        </b-form-group>
      </b-collapse>

      <!-- Input group for proxy filtering -->
      <span v-b-toggle.showProxyFilter onmouseover="" style="cursor: pointer;"> Search by proxy </span>
      <b-collapse id="showProxyFilter">
        <b-tabs pills card>
          <b-tab title="Alkanes" v-model="proxySelect" :options="options" active>
            <b-form-checkbox-group stacked id="alkaneCheckboxes" v-model="alkanesSelect" :options="optionsA">
            </b-form-checkbox-group>
          </b-tab>
          <b-tab title="Diatoms" v-model="proxySelect" :options="options">
            <b-form-checkbox-group stacked id="diatomCheckboxes" v-model="diatomsSelect" :options="optionsD">
            </b-form-checkbox-group>
          </b-tab>
          <b-tab title="Varves" v-model="proxySelect" :options="options">
            <b-form-checkbox-group stacked id="varvesCheckboxes" v-model="varvesSelect" :options="optionsV">
            </b-form-checkbox-group>
          </b-tab>
        </b-tabs>
      </b-collapse>

      <!-- Input group for age filtering -->
      <span v-b-toggle.showAgeFilter onmouseover="" style="cursor: pointer;"> Search by age </span>
      <b-collapse id="showAgeFilter">
        <b-form-group
            id="inputAgeCoverage"
            label="Age coverage:"
            label-class="text-sm-right"
            label-for="inputAgeCoverage">
          <b-form-input v-model="ageSelect.min" placeholder="min age [a B.P.]"></b-form-input>
          <b-form-input v-model="ageSelect.max" placeholder="max age [a B.P.]"></b-form-input>
        </b-form-group>
      </b-collapse>
    </b-row>
  </b-container>
</template>

<script>
  import bTab from 'bootstrap-vue/es/components/tabs/tab';
  import bTabs from 'bootstrap-vue/es/components/tabs/tabs';

  export default {
    name: 'BrowserTools',
    components: {
      bTab,
      bTabs,
    },
    data () {
      return {
        locationSelect: {
          lakeName: '',
          continent: '',
          country: '',
          latMin: '',
          latMax: '',
          lonMin: '',
          lonMax: '',
          elevationMin: '',
          elevationMax: '',
        },
        proxySelect: [],
        options: [
          { text: 'Alkanes', value: 'alkanes' },
          { text: 'Diatoms', value: 'diatoms' },
          { text: 'Varves', value: 'varves' },
        ],
        alkanesSelect: [],
        optionsA: [
          { text: 'alkane 1', value: 'a1' },
          { text: 'alkane 2', value: 'a2' },
          { text: 'alkane 3', value: 'a3' },
          { text: 'alkane 4', value: 'a4' },
        ],
        diatomsSelect: [],
        optionsD: [
          { text: 'd 1 ', value: 'd1' },
          { text: 'd 2', value: 'd2' },
          { text: 'd 3', value: 'd3' },
          { text: 'd4', value: 'd4' },
        ],
        varvesSelect: [],
        optionsV: [
          { text: 'Thickness', value: 'thickness' },
          { text: 'Dark layer thickness', value: 'dLayerThick' },
          { text: 'Light layer thickness', value: 'lLayerThick' },
          { text: 'Calcit thickness', value: 'calcThick' },
        ],
        ageSelect: {
          min: '',
          max: '',
        },
      };
    },

  };
</script>

<style lang="scss" scoped>
  .toolbox { //styling for scrollable menu
    position: relative;
    max-height: 300px;
    white-space: nowrap;
    overflow-y: scroll;
  }
</style>
