<template>
  <div>
    <b-row class="mt-3">
      <b-container fluid class="card-text small">
        <b-card header-tag="header"
                footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="align-left"/> Meta information
    </span>
          <b-row>
            <b-col sm="4">
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

            <b-col sm="4">
              <h6 class="font-weight-normal text-left">
                Core: <span>{{ 'core.label' }}</span>
              </h6>
              <hr>
              <!--Core meta output-->
              <b-row>
                <b-col cols="5" class="text-right">Longitude:</b-col>
                <b-col cols="7" class="text-left"> {{ 'core.longitude' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Latitude:</b-col>
                <b-col cols="7" class="text-left"> {{ 'core.latitude' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Elevation:</b-col>
                <b-col cols="7" class="text-left">{{ 'core.elevation' }}</b-col>
              </b-row>
              <hr/>
              <b-row>
                <b-col cols="5" class="text-right">Water depth:</b-col>
                <b-col cols="7" class="text-left">{{ 'core.waterDepth' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Core length:</b-col>
                <b-col cols="7" class="text-left">{{ 'core.length' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Depth start:</b-col>
                <b-col cols="7" class="text-left">{{ 'core.depthStart' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Depth end:</b-col>
                <b-col cols="7" class="text-left">{{ 'core.depthEnd' }}</b-col>
              </b-row>
              <hr/>
              <b-row>
                <b-col cols="5" class="text-right">Date of drilling:</b-col>
                <b-col cols="7" class="text-left">{{ 'core.drillDate' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Drilling method:</b-col>
                <b-col cols="7" class="text-left"> {{ 'core.drillMethod' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="5" class="text-right">Core type:</b-col>
                <b-col cols="7" class="text-left">{{ 'core.type' }}</b-col>
              </b-row>
            </b-col>

            <b-col sm="4">
              <b-card>
                <!-- Here should the MapAPI be placed-->
              </b-card>
            </b-col>
          </b-row>
          <span slot="footer" class="float-right">
      <b-button variant="primary" size="sm" v-b-toggle.showDetails>More details</b-button>
    </span>
        </b-card>
      </b-container>
    </b-row>

    <!-- #### NEW CARD(ROW) #### -->
    <b-row class="mt-3">
      <b-container fluid class="card-text small">
        <b-card header-tag="header"
                footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="align-left"/> Record information
    </span>
          <b-row>
            <b-col>
              <!--Record meta output-->
              <hr/>
              <b-row>
                <b-col cols="4" class="text-right">Name of datasheet:</b-col>
                <b-col class="text-left"> {{ 'collection.datasheetName' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="4" class="text-right">Proxy type:</b-col>
                <b-col class="text-left"> {{ 'collection.proxyType' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="4" class="text-right">Parameters:</b-col>
                <b-col class="text-left"> {{ 'collection.parameterList' }}</b-col>
              </b-row>
              <hr/>
              <b-row>
                <b-col cols="4" class="text-right">Analysis method:</b-col>
                <b-col class="text-left"> {{ 'collection.analysisMethod' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="4" class="text-right">Age-depth-method:</b-col>
                <b-col class="text-left"> {{ 'collection.ageDepthMethod' }}</b-col>
              </b-row>
              <hr/>
              <b-row>
                <b-col cols="4" class="text-right">Age coverage:</b-col>
                <b-col class="text-left"> {{ 'collection.proxyAgeMax' }}<span class="small"> - </span> {{
                  'collection.proxyAgeMin' }} <span class="small">years B.P.</span></b-col>
              </b-row>
              <b-row>
                <b-col cols="4" class="text-right">Age resolution:</b-col>
                <b-col class="text-left"> {{ 'collection.proxyAgeMax' }}</b-col>
              </b-row>
              <hr/>
              <b-row>
                <b-col cols="4" class="text-right">Uploaded by:</b-col>
                <b-col class="text-left"> {{ 'collection.uploadedBy' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="4" class="text-right">Upload date:</b-col>
                <b-col class="text-left"> {{ 'collection.uploadDate' }}</b-col>
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
            <b-col>
              <chart-test/>
            </b-col>
          </b-row>
          <span slot="footer" class="float-right">
      <b-button variant="primary" size="sm" v-b-toggle.showDescription>Read data description...</b-button>
    </span>
        </b-card>
      </b-container>
    </b-row>

    <!-- NEW CARD(ROW) -->
    <b-row class="mt-3">
      <b-container fluid class="card-text small">
        <b-card header-tag="header"
                footer-tag="footer">
    <span slot="header">
      <font-awesome-icon icon="book"/> Publication
    </span>
          <b-row>
            <b-col class="text-left">
              <h6 class="font-weight-normal">
              </h6>
              <!-- Publication meta output-->
              <hr/>
              <b-row>
                <b-col cols="4" lg="2" class="text-right">Authors:</b-col>
                <b-col class="text-left"> {{ 'publication.authors' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="4" lg="2" class="text-right">Year:</b-col>
                <b-col class="text-left"> {{ 'publication.year' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="4" lg="2" class="text-right">Title:</b-col>
                <b-col class="text-left"> {{ 'publication.title' }}</b-col>
              </b-row>
              <hr/>
              <b-row>
                <b-col cols="4" lg="2" class="text-right">Source:</b-col>
                <b-col class="text-left"> {{ 'publication.source' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="4" lg="2" class="text-right">DOI:</b-col>
                <b-col class="text-left"> {{ 'publication.doi' }}</b-col>
              </b-row>
              <b-row>
                <b-col cols="4" lg="2" class="text-right">Weblink:</b-col>
                <b-col class="text-left"> {{ 'publication.weblink' }}</b-col>
              </b-row>
              <hr/>
              <b-row>
                <b-col cols="4" lg="2" class="text-right">Contact mail:</b-col>
                <b-col class="text-left"> {{ 'publication.contact' }}</b-col>
              </b-row>
              <hr>
              <b-collapse id="showAbstract" class="mt-2">
                <b-row>
                  <b-col class="text-left text-bold">Abstract:</b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <p class="card-text">
                      {{ publicationAbstract }}
                    </p>
                  </b-col>
                </b-row>
              </b-collapse>
            </b-col>
            <b-col>
              <b-card>
                Further considerations: Quality rating (1-5 stars?), Access control list, Usage timeline (?),
                For which purposes has the dataset been used most frequently?
              </b-card>
            </b-col>
          </b-row>
          <span slot="footer" class="float-right">
        <b-button v-b-toggle.showAbstract variant="primary" size="sm">Read abstract...</b-button>
      </span>
        </b-card>
      </b-container>
    </b-row>
  </div>


</template>

<script>
  export default {
    name: 'BrowserViewDataset',
    data () {
      return {
        collectionDataDescription: 'Hello, eso es un descriptión',
        publicationAbstract: 'abstract',
      };
    },
  };
</script>

<style scoped>

</style>
