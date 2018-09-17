<template>
  <b-container fluid>
    <b-row>
      <b-col cols="12" lg="6">
        <b-card header-tag="header" footer-tag="footer">
          <h1 slot="header">Lake details</h1>
          <b-container fluid class="card-text">
            <b-row>
              <b-col>
                <h5 class="font-weight-normal text-left">
                  Lake: <span>{{ 'lake.name' }}</span>
                </h5>
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
                  <b-col cols="7" class="text-left"> {{ 'lake.surface_level' }}</b-col>
                </b-row>
                <hr/>
                <b-row>
                  <b-col cols="5" class="text-right">Maximum depth:</b-col>
                  <b-col cols="7" class="text-left"> {{ 'lake.max_depth' }}</b-col>
                </b-row>
                <b-row>
                  <b-col cols="5" class="text-right">Surface area:</b-col>
                  <b-col cols="7" class="text-left"> {{ 'lake.surface_area' }}</b-col>
                </b-row>
                <b-row>
                  <b-col cols="5" class="text-right">Water body volume:</b-col>
                  <b-col cols="7" class="text-left"> {{ 'lake.water_body_volume' }}</b-col>
                </b-row>
                <hr/>
                <b-row>
                  <b-col cols="5" class="text-right">Catchment area:</b-col>
                  <b-col cols="7" class="text-left"> {{ 'lake.catchment_area' }}</b-col>
                </b-row>
              </b-col>
            </b-row>
          </b-container>
        </b-card>
      </b-col>
      <div class="d-block d-lg-none mt-4 w-100"></div>
      <b-col cols="12" lg="6">
        <b-card header-tag="header" footer-tag="footer">
          <h1 slot="header">Map</h1>
          <b-container fluid class="card-text">
            [The map will be displayed here]
          </b-container>
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="mt-4">
        <b-card>
          <b-table hover outlined striped caption-top show-empty :items="[]" :fields="['id', 'name']">
            <template slot="table-caption">
              This is a table caption.
            </template>
          </b-table>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import bTable from 'bootstrap-vue/es/components/table/table';

  export default {
    name: 'DatabaseViewDetails',
    components: {
      bTable,
    },
    computed: {
      ...mapState('database', [
        'results',
      ]),
    },
    mounted () {
      this.$store.commit('database/DETAILS_ID_SET', this.$route.params['id']);
    },
  };
</script>

<style lang="scss" scoped>

</style>
