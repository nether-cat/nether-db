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
            <chart-test/>
          </b-col>
        </b-row>
  </b-container>
      </b-card>
</template>

<script>
  import ChartTest from './ChartTest';

  export default {
    name: 'BrowserCardProxyCharts',
    components: {
      ChartTest,
    },
  };
</script>

<style scoped>

</style>
