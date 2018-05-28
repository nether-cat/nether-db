<template>
  <div>
  <b-card header-tag="header"
          footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="align-left"/> Record information
    </span>
    <b-container fluid class="card-text small">
        <b-col class="text-left">
          <h6 class="font-weight-normal">
            Record information:
          </h6>
          <!--Record meta output-->
          <hr/>
          <b-row>
            <b-col class="text-right">Name of datasheet:</b-col>
            <b-col class="text-left"> {{ "datasheetName" }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Proxy type:</b-col>
            <b-col class="text-left"> {{ "proxyType" }} </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Parameters:</b-col>
            <b-col class="text-left"> {{ "parameterList" }} </b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col class="text-right">Uploaded by:</b-col>
            <b-col class="text-left"> {{ "uploadedBy" }} </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Upload date:</b-col>
            <b-col class="text-left"> {{ "uploadDate" }} </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Analysis method:</b-col>
            <b-col class="text-left"> {{ "analysisMethod" }} </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Age-depth-method:</b-col>
            <b-col class="text-left"> {{ "ageDepthMethod" }} </b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col class="text-right">Age coverage:</b-col>
            <b-col class="text-left"> {{ "proxyAgeMax" }}<span class="small"> - </span> {{ "proxyAgeMin" }} <span class="small">years B.P.</span></b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Age resolution:</b-col>
            <b-col class="text-left"> {{ "proxyAgeMax" }}</b-col>
          </b-row>

        </b-col>
    </b-container>
    <span slot="footer" class="float-right">
      <b-button variant="primary" size="sm" v-b-toggle.collapse1>Read data description...</b-button>
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
