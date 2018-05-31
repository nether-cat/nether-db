<template>
  <b-card header-tag="header"
          footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="chart-line"/> Proxy Charts
    </span>
    <b-container fluid>
        <h6 class="font-weight-normal">
        </h6>
        <!-- Proxy chart output-->
        <b-row>
          <b-col>
            <test-chart1/>
          </b-col>
        </b-row>
  </b-container>
      </b-card>
</template>

<script>
  import TestChart1 from './TestChart1';
  import TestChart2 from './TestChart2';

  export default {
    name: 'BrowserCardProxyCharts',
    components: {
      TestChart1,
    },
  };
</script>

<style scoped>

</style>