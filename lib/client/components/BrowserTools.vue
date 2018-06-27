<template>
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
            <h6>Tephra layers</h6>
            <hr>
            <p>Search and filter results by tephra layers</p>
          </b-container>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import BrowserTableLakes from './BrowserTableLakes';
  import BrowserToolsLocation from './BrowserToolsLocation';
  import BrowserToolsProxy from './BrowserToolsProxy';

  export default {
    name: 'BrowserTools',
    components: {
      BrowserTableLakes,
      BrowserToolsLocation,
      BrowserToolsProxy,
    },
  };
</script>

<style scoped>

</style>
