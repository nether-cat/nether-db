<template>
  <b-container fluid>
    <b-row>
      <browser-tools/>
    </b-row>
    <hr>
    <b-row>
      <h1> Output table: </h1>
      <browser-table-lakes/>
    </b-row>
    <b-button-group>
      <b-button variant="primary" size="sm" v-b-toggle.datasetView>Press for single dataset view</b-button>
      <b-button variant="primary" size="sm" v-b-toggle.lakeView>Press for lake view</b-button>
    </b-button-group>

    <b-collapse id="datasetView">
      <browser-view-dataset/>
    </b-collapse>
    <b-collapse id="lakeView">
      <browser-view-lake/>
    </b-collapse>
  </b-container>
</template>

<script>
  import BrowserTableLakes from './BrowserTableLakes';
  import BrowserTools from './BrowserTools';
  import BrowserViewDataset from './BrowserViewDataset';
  import BrowserViewLake from './BrowserViewLake';

  export default {
    name: 'TheBrowser',
    components: {
      BrowserTableLakes,
      BrowserTools,
      BrowserViewDataset,
      BrowserViewLake,
    },
  };
</script>

<style scoped>

</style>
