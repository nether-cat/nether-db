<template>
  <b-container fluid>
    <b-row>
      <b-col lg="2" class="mt-2">
        <div class="mb-2">
          <browser-tools/>
        </div>
        <b-button size="sm" type="submit">
          <span>Get data </span>
          <font-awesome-icon icon="search"/>
        </b-button>
      </b-col>

      <b-col>
        <b-card class="mt-2 mr-2">
          <h6> Output table: </h6>
          <browser-table-lakes/>
        </b-card>
        <hr>
        <b-button-group>
          <b-button variant="primary" size="sm" v-b-toggle.datasetView>Single dataset view</b-button>
          <b-button variant="primary" size="sm" v-b-toggle.lakeView>Lake view</b-button>
        </b-button-group>

        <b-collapse id="datasetView">
          <browser-view-dataset/>
        </b-collapse>
        <b-collapse id="lakeView">
          <browser-view-lake/>
        </b-collapse>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import bButtonGroup from 'bootstrap-vue/es/components/button-group/button-group';
  import bFormInput from 'bootstrap-vue/es/components/form-input/form-input';
  import bDropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
  import BrowserTableLakes from './BrowserTableLakes';
  import BrowserTools from './BrowserTools';
  import BrowserViewDataset from './BrowserViewDataset';
  import BrowserViewLake from './BrowserViewLake';

  export default {
    name: 'TheBrowser',
    components: {
      bButtonGroup,
      bFormInput,
      bDropdownItem,
      BrowserTableLakes,
      BrowserTools,
      BrowserViewDataset,
      BrowserViewLake,
    },
  };
</script>

<style>
</style>
