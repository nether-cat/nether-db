<template>
  <b-card>
    <b-container fluid class="card-text small">
      <h6 v-b-toggle.showProxyFilter onmouseover="" style="cursor: pointer;"> Search by proxy </h6>
      <hr>
      <b-collapse id="showProxyFilter" class="mt-2">
        <b-card no-body>
          <b-tabs pills card vertical end>
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
        </b-card>

        <hr>
        <hr>
        <div>Selected proxies: <p> {{ proxySelect }} </p>
        </div>
        <div>Selected alkane parameters: <p> {{ alkanesSelect }} </p>
        </div>
        <div>Selected diatom parameters: <p> {{ diatomsSelect }} </p>
        </div>
        <div>Selected varve parameters: <p> {{ varvesSelect }} </p>
        </div>
      </b-collapse>
    </b-container>
  </b-card>
</template>

<script>
  export default {
    name: 'BrowserToolsProxy',

    data () {
      return {
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
      };
    },
  };
</script>

<style>

</style>