<template>
  <b-container fluid>
        <b-row>
          <browser-tools/>
          <b-button  variant="primary" size="sm" v-b-toggle.datasetView>Press for single dataset view</b-button>
        </b-row>
    <b-collapse id="datasetView">
        <b-row class="mt-3">
          <b-col lg="8" class="ml-0">
            <browser-card-meta/>
          </b-col>
          <b-col lg="4" class="ml-0">
            <map-api/>
          </b-col>
        </b-row>
        <b-collapse id="showDetails">
          <b-row class="mt-3">
           <b-col lg="8" class="ml-0">
            <browser-card-publication/>
           </b-col>
              <b-col lg="4">
                <b-card> Weitere Angaben: Qualitätsbewertung (5 Sterne?), Zugriffsberechtigung, Nutzungstimeline(?), Für welche Zwecke wird dieser Datensatz am häufigsten genutzt?</b-card>
              </b-col>
          </b-row>
          <b-row class="mt-3">
            <b-col lg="4">
              <browser-card-collection/>
            </b-col>
            <b-col lg="8" class="ml-0">
              <browser-card-proxy-charts/>
            </b-col>
          </b-row>
        </b-collapse>
    </b-collapse>
  </b-container>
</template>

<script>
  import BrowserTools from './BrowserTools';
  import BrowserCardMeta from './BrowserCardMeta';
  import BrowserCardPublication from './BrowserCardPublication';
  import BrowserCardCollection from './BrowserCardCollection';
  import BrowserCardProxyCharts from './BrowserCardProxyCharts';
  import MapApi from './MapApi';

  export default {
    name: 'TheBrowser',
    components: {
      BrowserTools,
      BrowserCardMeta,
      BrowserCardPublication,
      BrowserCardCollection,
      BrowserCardProxyCharts,
      MapApi,
    },
  };
</script>

<style>

</style>
