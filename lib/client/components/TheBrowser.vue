<template>
  <b-container fluid>
    <b-row>
      <browser-tools/>
    </b-row>
    <b-row>
      <browser-table-lakes/>
    </b-row>
    <b-button variant="primary" size="sm" v-b-toggle.datasetView>Press for single dataset view</b-button>
    <b-collapse id="datasetView">
      <b-row class="mt-3">
        <b-col lg="8" class="ml-0">
          <browser-card-meta/>
        </b-col>
        <b-col lg="4" class="ml-0">
          <browser-card-map/>
        </b-col>
      </b-row>
      <b-collapse id="showDetails">
        <b-row class="mt-3">
          <b-col lg="8" class="ml-0">
            <browser-card-publication/>
          </b-col>
          <b-col lg="4">
            <b-card>
              Further considerations: Quality rating (1-5 stars?), Access control list, Usage timeline (?),
              For which purposes has the dataset been used most frequently?
            </b-card>
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
  import BrowserCardCollection from './BrowserCardCollection';
  import BrowserCardMap from './BrowserCardMap';
  import BrowserCardMeta from './BrowserCardMeta';
  import BrowserCardProxyCharts from './BrowserCardProxyCharts';
  import BrowserCardPublication from './BrowserCardPublication';
  import BrowserTableLakes from './BrowserTableLakes';
  import BrowserTools from './BrowserTools';

  export default {
    name: 'TheBrowser',
    components: {
      BrowserCardCollection,
      BrowserCardMap,
      BrowserCardMeta,
      BrowserCardProxyCharts,
      BrowserCardPublication,
      BrowserTableLakes,
      BrowserTools,
    },
  };
</script>

<style scoped>

</style>
