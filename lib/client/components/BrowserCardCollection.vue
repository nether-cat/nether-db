<template>
  <div>
  <b-card header-tag="header"
          footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="align-left"/> Record information
    </span>
    <b-container fluid class="card-text small">
      <b-row>
        <b-col>
          <h6 class="text-left font-weight-normal">
            Record information:
          </h6>
          <!--Record meta output-->
          <hr/>
          <b-row>
            <b-col cols="4" class="text-right">Name of datasheet:</b-col>
            <b-col class="text-left"> {{ "collection.datasheetName" }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="text-right">Proxy type:</b-col>
            <b-col class="text-left"> {{ "collection.proxyType" }} </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="text-right">Parameters:</b-col>
            <b-col class="text-left"> {{ "collection.parameterList" }} </b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col cols="4" class="text-right">Analysis method:</b-col>
            <b-col class="text-left"> {{ "collection.analysisMethod" }} </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="text-right">Age-depth-method:</b-col>
            <b-col class="text-left"> {{ "collection.ageDepthMethod" }} </b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col cols="4" class="text-right">Age coverage:</b-col>
            <b-col class="text-left"> {{ "collection.proxyAgeMax" }}<span class="small"> - </span> {{ "collection.proxyAgeMin" }} <span class="small">years B.P.</span></b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="text-right">Age resolution:</b-col>
            <b-col class="text-left"> {{ "collection.proxyAgeMax" }}</b-col>
          </b-row>
          <hr/>
          <b-row>
            <b-col cols="4" class="text-right">Uploaded by:</b-col>
            <b-col class="text-left"> {{ "collection.uploadedBy" }} </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" class="text-right">Upload date:</b-col>
            <b-col class="text-left"> {{ "collection.uploadDate" }} </b-col>
          </b-row>
          <hr>
          <b-collapse id="showDescription" class="mt-2">
            <b-row>
              <b-col class="text-left text-bold">Data description:</b-col>
            </b-row>
            <b-row>
              <b-col>
                <p class="card-text">
                  {{ collectionDataDescription }}
                </p>
              </b-col>
            </b-row>
          </b-collapse>
        </b-col>
      </b-row>
    </b-container>
    <span slot="footer" class="float-right">
      <b-button variant="primary" size="sm" v-b-toggle.showDescription>Read data description...</b-button>
    </span>
  </b-card>
  </div>
</template>

<script>
  export default {
    name: 'BrowserCollectionCard',

    data () {
      return {
        collectionDataDescription: `Hello, eso es un descriptión`
      }
    }
  };
</script>

<style scoped>

</style>
