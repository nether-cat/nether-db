<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12">
        <b-row>
          <b-col>
            <browser-card-meta/>
          </b-col>
          <b-col class="col-sm-4">
            <map-api/>
          </b-col>
        </b-row>
        <b-collapse id="collapse1">
          <b-row class="mt-3">
           <b-col>
            <browser-card-publication/>
           </b-col>
            <b-col class="col-sm-4">
              <b-card> Weitere Angaben: Qualitätsbewertung (5 Sterne?), Zugriffsberechtigung, Nutzungstimeline(?), Für welche Zwecke wird dieser Datensatz am häufigsten genutzt?</b-card>
            </b-col>
          </b-row>
          <b-row class="mt-3">
            <b-col class="col-sm-4">
              <browser-card-collection/>
            </b-col>
            <b-col>
              <browser-card-proxy-charts/>
            </b-col>
          </b-row>
        </b-collapse>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import BrowserCardMeta from './BrowserCardMeta';
  import BrowserCardPublication from './BrowserCardPublication';
  import BrowserCardCollection from './BrowserCardCollection';
  import BrowserCardProxyCharts from './BrowserCardProxyCharts';
  import MapApi from './MapApi';

  export default {
    name: 'TheBrowser',
    components: {
      BrowserCardMeta,
      BrowserCardPublication,
      BrowserCardCollection,
      BrowserCardProxyCharts,
      MapApi,
    },
  };
</script>

<style scoped>

</style>
