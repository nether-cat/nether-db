<template>
  <div>
    <b-row class="mt-3">
      <b-container fluid class="card-text small">
        <b-card>
          <b-row>
            <b-col>
              <h6 class="font-weight-normal text-left">
                Lake: <span>{{ 'lake.name' }}</span>
              </h6>
              <!--Lake meta output-->
              <hr/>
              <b-row>
                <b-col cols="5" class="text-right">Longitude:</b-col>
                <b-col cols="7" class="text-left"> {{ 'lake.longitude' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Latitude:</b-col>
                <b-col cols="7" class="text-left"> {{ 'lake.latitude' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Surface level:</b-col>
                <b-col cols="7" class="text-left"> {{ 'lake.surfaceLevel' }}</b-col>
              </b-row>
              <hr/>
              <b-row>
                <b-col cols="5" class="text-right">Maximum depth:</b-col>
                <b-col cols="7" class="text-left"> {{ 'lake.maxDepth' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Mean depth:</b-col>
                <b-col cols="7" class="text-left"> {{ 'lake.meanDepth' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Surface area:</b-col>
                <b-col cols="7" class="text-left"> {{ 'lake.surfArea' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Basin volume:</b-col>
                <b-col cols="7" class="text-left"> {{ 'lake.basinVol' }}</b-col>
              </b-row>
              <hr/>
              <b-row>
                <b-col cols="5" class="text-right">Climate zone:</b-col>
                <b-col cols="7" class="text-left"> {{ 'lake.climate' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Conductivity class:</b-col>
                <b-col cols="7" class="text-left"> {{ 'lake.conductivity' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Trophic state:</b-col>
                <b-col cols="7" class="text-left"> {{ 'lake.trophicState' }}</b-col>
              </b-row>
            </b-col>

            <b-col sm="8">
              <b-card class="mt-3">
                <!-- Here the map should be embedded -->
              </b-card>
            </b-col>
          </b-row>
        </b-card>
      </b-container>
    </b-row>


    <b-row class="mt-3">
      <b-col sm="8">
        <b-card>
          <browser-table-datasets/>
        </b-card>
      </b-col>
      <b-col>
        <b-card>
          <p>D3 dataset visualisations</p>
        </b-card>
      </b-col>
    </b-row>

  </div>
</template>

<script>
  import BrowserTableDatasets from './BrowserTableDatasets';

  export default {
    name: 'BrowserViewLake',
    components: {
      BrowserTableDatasets,
    },
  };
</script>

<style scoped>

</style>
