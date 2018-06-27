<template>
  <div>
  <b-card header-tag="header"
          footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="info-circle"/> Meta information
    </span>
    <b-container fluid class="card-text small">
      <b-row>
        <b-col sm="5" class="text-left">
          <h6 class="font-weight-normal">
            Lake: <span>{{ "lakeName" }}</span>
          </h6>
          <!--Lake meta output-->
          <hr/>
          <b-row>
            <b-col cols="5" class="text-right">Longitude:</b-col>
            <b-col cols="7" class="text-left"> {{ "lake.longongitude" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Latitude:</b-col>
            <b-col cols="7" class="text-left"> {{ "lake.latitude" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Surface level:</b-col>
            <b-col cols="7" class="text-left"> {{ "lake.surfaceLevel" }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col cols="5" class="text-right">Maximum depth:</b-col>
            <b-col cols="7" class="text-left"> {{ "lake.maxDepth" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Mean depth:</b-col>
            <b-col cols="7" class="text-left"> {{ "lake.meanDepth" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Surface area:</b-col>
            <b-col cols="7" class="text-left"> {{ "lake.surfArea" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Basin volume:</b-col>
            <b-col cols="7" class="text-left"> {{ "lake.basinVol" }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col cols="5" class="text-right">Climate zone:</b-col>
            <b-col cols="7" class="text-left"> {{ "lake.climate" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Conductivity class:</b-col>
            <b-col cols="7" class="text-left"> {{ "lake.conductivity" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Trophic state:</b-col>
            <b-col cols="7" class="text-left"> {{ "lake.trophicState" }}</b-col>
          </b-row>
        </b-col>
        <b-col sm="2"><br></b-col>
        <b-col sm="5" class="text-left">
          <h6 class="font-weight-normal">
            Core: <span>{{ "core.label" }}</span>
          </h6>
          <hr>
          <!--Core meta output-->
          <b-row>
            <b-col cols="5" class="text-right">Longitude:</b-col>
            <b-col cols="7" class="text-left"> {{ "core.longitude" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Latitude:</b-col>
            <b-col cols="7" class="text-left"> {{ "core.latitude" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Elevation:</b-col>
            <b-col cols="7" class="text-left">{{ "core.elevation" }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col cols="5" class="text-right">Water depth:</b-col>
            <b-col cols="7" class="text-left">{{ "core.waterDepth" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Core length:</b-col>
            <b-col cols="7" class="text-left">{{ "core.length" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Depth start:</b-col>
            <b-col cols="7" class="text-left">{{ "core.depthStart" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="5" class="text-right">Depth end:</b-col>
            <b-col cols="7" class="text-left">{{ "core.depthEnd" }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col cols="5" class="text-right">Date of drilling:</b-col>
            <b-col  cols="7" class="text-left">{{ "core.drillDate" }}</b-col>
          </b-row>
          <b-row>
            <b-col  cols="5" class="text-right">Drilling method:</b-col>
            <b-col  cols="7" class="text-left"> {{ "core.drillMethod" }}</b-col>
          </b-row>
          <b-row>
            <b-col  cols="5" class="text-right">Core type:</b-col>
            <b-col  cols="7" class="text-left">{{ "core.type" }}</b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-container>
    <span slot="footer" class="float-right">
      <b-button variant="primary" size="sm" v-b-toggle.showDetails>More details</b-button>
    </span>
  </b-card>
  </div>
</template>

<script>
  export default {
    name: 'BrowserCardMeta',
  };
</script>

<style scoped>

</style>
