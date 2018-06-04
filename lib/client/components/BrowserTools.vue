<template>
  <!-- ++++ Version 2 - Kacheln +++ Version 1 siehe unten +++ -->
    <b-container fluid>
      <b-row>
        <b-col>
            <browser-tools-location/>
        </b-col>

        <b-col>
          <browser-tools-proxy/>
        </b-col>

        <b-col>
          <b-card>
            <b-container fluid>
              <h6> Tephra layers</h6>
              <hr>
              <p>Such- und Filteroptionen für Tephren</p>
            </b-container>
          </b-card>
        </b-col>
<!--
        <b-col>
          <b-card>
            <b-container fluid>
              <h6>Publications</h6>
              <hr>
              <p>Such- und Filteroptionen für Publikationen</p>
            </b-container>
          </b-card>
        </b-col>
              -->
      </b-row>
    </b-container>

</template>

<script>
  import browserTableLakes from './BrowserTableLakes';
  import browserToolsLocation from './BrowserToolsLocation';
  import browserToolsProxy from './BrowserToolsProxy';

  export default {
    name: 'browserTools',
    components: {
      browserTableLakes,
      browserToolsLocation,
      browserToolsProxy,
    },

      data () {
        return {
          location: {
            lakeName: "",
            continent: "",
            country: "",
            latMin: "",
            latMax: "",
            lonMin: "",
            lonMax: "",
            elevationMin: "",
            elevationMax: "",
          },

           proxySelect: [], //proxy selection
           optionsProx: [
            {text: 'Alkanes', value: 'alkanes'},
            {text: 'Diatoms', value: 'diatoms'},
            {text: 'Varves', value: 'varves'},
          ]
      }
    },
  };
</script>

<style>

</style>