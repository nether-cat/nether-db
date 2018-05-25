<template>
  <div>
  <b-card header-tag="header"
          footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="info-circle"/> Record information
    </span>
    <b-container fluid class="card-text small">
        <b-col class="text-left">
          <h6 class="font-weight-normal">
            Lake: <span>{{ "lakeName" }}</span>
          </h6>
          <!--Lake meta output-->
          <hr/>
          <b-row>
            <b-col class="text-right">Longitude:</b-col>
            <b-col class="text-left"> {{ "lakeLong" }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Latitude:</b-col>
            <b-col class="text-left"> {{ "lakeLat" }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Surface level:</b-col>
            <b-col class="text-left"> {{ "surfaceLevel" }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col class="text-right">Maximum depth:</b-col>
            <b-col class="text-left"> {{ "maxDepth" }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Mean depth:</b-col>
            <b-col class="text-left"> {{ "meanDepth" }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Surface area:</b-col>
            <b-col class="text-left"> {{ "surfArea" }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Basin volume:</b-col>
            <b-col class="text-left"> {{ "basinVol" }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col class="text-right">Climate zone:</b-col>
            <b-col class="text-left"> {{ "lakeClimate" }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Conductivity class:</b-col>
            <b-col class="text-left"> {{ "conductivity" }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Trophic state:</b-col>
            <b-col class="text-left"> {{ "trophicState" }}</b-col>
          </b-row>
        </b-col>
    </b-container>
    <span slot="footer" class="float-right">
      <b-button variant="primary" size="sm" v-b-toggle.collapse1>More details</b-button>
    </span>
  </b-card>
  </div>
</template>

<script>
  export default {
    name: 'BrowserCollectionCard',
  };
</script>

<style scoped>

</style>
